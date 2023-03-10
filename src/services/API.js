import { getRequest, postRequest } from "./util";
const SimpleWebAuthnBrowser = window.SimpleWebAuthnBrowser;
console.log(SimpleWebAuthnBrowser);
let _ = undefined;
let loginStep = 1;
let challenge = undefined;
let account = null;

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

const checkAuthOptionsAPICall = async (user) => {
  return await postRequest(_, "/auth/auth-options", user);
};

const checkAuthOptions = async () => {
  const res = await checkAuthOptionsAPICall({
    email: document.getElementById("login_email").value,
  });
  if (res.password) {
    document.getElementById("login_section_password").hidden = false;
  }
  if (res.webAuthn) {
    document.getElementById("login_section_webauthn").hidden = false;
  }
  challenge = res.challenge;
  loginStep = 2;
};

const loginClientSide = async (e) => {
  try {
    if (e) {
      e.preventDefault();
    }
    if (loginStep === 1) {
      checkAuthOptions();
    } else {
      //step 2
      const user = {
        email: document.getElementById("login_email").value,
        password: document.getElementById("login_password").value,
      };

      const res = await loginAPICall(user);
      return postLogin(res, {
        ...user,
        name: res.name,
      });
    }
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
    let isLoggedIn = true;
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
  let isLoggedIn = false;
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

const sendMagicLinkAPICall = async (user) => {
  return await postRequest(_, "/auth/magicLink", user);
};

const sendMagicLinkClientSide = async (e) => {
  // prevent default behavior
  e.preventDefault();

  // check if the toggle is on
  let user = {
    email: document.getElementById("magic_email").value,
    name: document.getElementById("magic_name").value,
  };

  // something is wrong with API call
  const res = await sendMagicLinkAPICall(user);
  return await res;
  // console.log(res, postLogin(res, user));
  // return postLogin(res, user);
};

const extractMagicToken = async (e) => {
  e.preventDefault();
  const jwtString = new URLSearchParams(location.search);
  const res = await getRequest(_, `/account?${jwtString}`);

  if (!res.ok) {
    return false;
  }

  let user = {
    email: res.decoded.email,
    name: res.decoded.name,
  };
  console.log(postLogin(res, user));
  return postLogin(res, user);
};

// const initWebAuthn = () => {
//   document.getElementById("login_section_password").hidden = true;
//   document.getElementById("login_section_webauthn").hidden = true;
// };

const addWebAuthn = async (user) => {
  try {
    //s1: go to the server and ask for the challenge and options
    const options = await webAuthn.registrationOptions(user);

    console.log(options);
    options.authenticatorSelection.residentKey = "required";
    options.authenticatorSelection.requireResidentKey = true;
    options.extensions = {
      credProps: true,
    };
    console.log(options);
    //s2: take webAuthn response and pass options into startRegistation

    const authRes = await SimpleWebAuthnBrowser.startRegistration(options);
    console.log(authRes, "line 194");
    //S3: send auth response back to the server to be verified
    const verificationRes = await webAuthn.registrationVerification(authRes);
    if (verificationRes.ok) {
      alert("You can use WebAuthn to login");
    } else {
      alert(verificationRes.message);
    }
  } catch (e) {
    console.error(e.message);
  }
};

const webAuthn = {
  loginOptions: async (email) => {
    return await postRequest(_, "/auth/webauth-login-options", { email });
  },
  loginVerification: async (email, data) => {
    return await postRequest(_, "/auth/webauth-login-verification", {
      email,
      data,
    });
  },
  registrationOptions: async ({ account }) => {
    return await postRequest(_, "/auth/webauth-registration-options", account);
  },
  registrationVerification: async (data) => {
    return await postRequest(_, "/auth/webauth-registration-verification", {
      user: account,
      data,
    });
  },
};

// send an email to the user and validate if the email actually exists
// return the user to the home page with name and account ig

export {
  loginClientSide,
  registerClientSide,
  postLogin,
  logout,
  autoLogin,
  GoogleAuthClientSide,
  sendMagicLinkClientSide,
  extractMagicToken,
  addWebAuthn,
};
