import express from 'express';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const router = express.Router();

const WECHAT_APP_ID = process.env.WECHAT_APP_ID;
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET;
const WECHAT_REDIRECT_URI = process.env.WECHAT_REDIRECT_URI;

// 1. Get WeChat OAuth URL
router.get('/wechat/url', (req, res) => {
  const { state } = req.query;
  const safeState = state ? encodeURIComponent(state as string) : 'STATE';
  // This is for WeChat Web (QR Code login)
  const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APP_ID}&redirect_uri=${encodeURIComponent(WECHAT_REDIRECT_URI || '')}&response_type=code&scope=snsapi_login&state=${safeState}#wechat_redirect`;
  res.json({ url });
});

// 2. WeChat Callback
router.get('/wechat/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // 1. Exchange code for access token and openid
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`;
    const tokenResponse = await axios.get(tokenUrl);
    
    const { access_token, openid, unionid, errcode, errmsg } = tokenResponse.data;

    if (errcode) {
      throw new Error(`WeChat API Error: ${errmsg} (${errcode})`);
    }

    if (!openid) {
      throw new Error('Failed to get openid from WeChat');
    }

    // 2. Get user info from WeChat
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`;
    const userInfoResponse = await axios.get(userInfoUrl);
    const userInfo = userInfoResponse.data;

    // 3. Check if user already exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('wechat_openid', openid)
      .maybeSingle();

    let userId;
    let userEmail;

    if (profile) {
      userId = profile.id;
      userEmail = profile.email;
    } else {
      // Create a new user in Supabase Auth
      userEmail = `${openid}@wechat.horizon.com`;
      // Generate a stable but "hidden" password for the user
      // In a real app, you might use a different strategy or a magic link
      const tempPassword = `WX_${openid}_${WECHAT_APP_SECRET?.slice(0, 8)}`;

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: userInfo.nickname,
          avatar_url: userInfo.headimgurl,
          wechat_openid: openid,
          wechat_unionid: unionid
        }
      });

      if (authError) {
        // If user already exists by email (unlikely but possible), try to get them robustly
        if (authError.message.includes('already registered')) {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', userEmail)
              .single();
              
            if (existingProfile) {
                userId = existingProfile.id;
            } else {
                throw authError;
            }
        } else {
            throw authError;
        }
      } else {
        userId = authUser.user.id;
      }

      // 4. Update/Create the profile with WeChat info
      const { error: updateError } = await supabase.from('profiles').upsert({
        id: userId,
        wechat_openid: openid,
        wechat_unionid: unionid,
        full_name: userInfo.nickname,
        avatar_url: userInfo.headimgurl,
        email: userEmail,
        updated_at: new Date().toISOString()
      });

      if (updateError) console.error('Profile update error:', updateError);
    }

    // 5. Generate a magic link for the user to sign in on the frontend
    // This is the cleanest way to transfer the session to the frontend
    const redirectUrl = new URL(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`);
    redirectUrl.searchParams.set('method', 'wechat');
    if (state) redirectUrl.searchParams.set('state', state as string);

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
      options: {
        redirectTo: redirectUrl.toString()
      }
    });

    if (linkError) throw linkError;

    // Redirect the user to the magic link which will then redirect to our app and log them in
    res.redirect(linkData.properties.action_link);

  } catch (err: any) {
    console.error('WeChat Auth Error:', err);
    res.status(500).redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=${encodeURIComponent(err.message)}`);
  }
});

export default router;
