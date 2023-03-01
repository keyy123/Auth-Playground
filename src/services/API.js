import { postRequest } from "./util";
let _ = undefined;
const loginAPICall = async (user) => {
  try {
    return await postRequest(_, "/auth/login", user);
  } catch (e) {
    console.error(e);
  }
};

const registerAPICall = async (user) => {
  return await postRequest(_, "/auth/register", user);
};

const loginClientSide = async (e) => {
  try {
    if (e) {
      e.preventDefault();
    }
    const user = {
      email: document.getElementById("login_email").value,
      password: document.getElementById("login_password").value,
    };

    const res = await loginAPICall(user);
    return postLogin(res, {
      ...user,
      name: res.name,
    });
  } catch (e) {
    console.error(e);
  }
};

const registerClientSide = async (e) => {
  if (e) {
    e.preventDefault();
  }
  const user = {
    name: document.getElementById("register_name").value,
    email: document.getElementById("register_email").value,
    password: document.getElementById("register_password").value,
  };
  const res = await registerAPICall(user);
  return postLogin(res, user);
};

const postLogin = (response, user) => {
  if (response.ok) {
    let isLoggedIn = true,
      account = user;
    return { isLoggedIn, account };
  } else {
    alert(response.message);
  }
  // Credentials API - auto login
  if (window.PasswordCredential && user.password) {
    // eslint-disable-next-line no-undef
    const credentials = new PasswordCredential({
      id: user.email,
      password: user.password,
      name: user.name,
    });
    console.log(credentials);
    navigator.credentials.store(credentials);
  }
};

const autoLogin = async () => {
  if (window.PasswordCredential) {
    const credentials = await navigator.credentials.get({ password: true });
    document.getElementById("login_email").value = credentials.id;
    document.getElementById("login_password").value = credentials.password;
    return await loginClientSide();
  }
};

const logout = () => {
  let isLoggedIn = false,
    account = null;
  if (window.PasswordCredential) {
    // next time you login it wont be automatically/silent
    navigator.credentials.preventSilentAccess();
  }
  return { isLoggedIn, account };
};

const GoogleAuthAPICall = async (data) => {
  return await postRequest(_, "/auth/login-google", data);
};

const GoogleAuthClientSide = async (data) => {
  const res = await GoogleAuthAPICall({
    credential: data,
  });
  console.log(
    res,
    postLogin(res, {
      name: res.name,
      email: res.email,
    })
  );
  // name and email
  return postLogin(res, {
    name: res.name,
    email: res.email,
  });
};

const MagicLinkAuthAPICall = async (user) => {
  return await postRequest(_, "/auth/magicLink", user);
};

const MagicLinkAuthClientSide = async (user) => {
  // send an email to the user and validate if the email actually exists
  // return the user to the home page with name and account ig
  let user = {
    email: document.getElementById("").value,
    name: document.getElementById("").value,
  };

  const res = await MagicLinkAuthAPICall(user);
};

export {
  loginClientSide,
  registerClientSide,
  postLogin,
  logout,
  autoLogin,
  GoogleAuthClientSide,
};
