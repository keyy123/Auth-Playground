import { postRequest } from "./util";

const loginAPICall = async (user) => {
  return await postRequest("http://localhost:3000/auth/login", user);
};

const registerAPICall = async (user) => {
  return await postRequest("http://localhost:3000/auth/register", user);
};

const loginClientSide = async (e) => {
  if (e) e.preventDefault();
  const user = {
    email: document.getElementById("login_email").value,
    password: document.getElementById("login_password").value,
  };

  const res = await loginAPICall(user);
  return postLogin(res, {
    // ...user,
    email: user.email,
    name: res.name,
  });
};

const registerClientSide = async (e) => {
  e.preventDefault();
  const user = {
    name: document.getElementById("register_name").value,
    email: document.getElementById("register_email").value,
    password: document.getElementById("register_password").value,
  };
  const res = await registerAPICall(user);
  console.log(res, "API.js - line 35");
  console.log(
    postLogin(res, {
      name: user.name,
      email: user.email,
    })
  );
  return postLogin(res, {
    name: user.name,
    email: user.email,
  });
};

const postLogin = (response, user) => {
  if (response.ok) {
    let isLoggedIn = true,
      account = user;
    return { isLoggedIn, account };
  } else {
    alert(response.message);
  }
};
const logout = () => {
  let isLoggedIn = false,
    account = null;
  return { isLoggedIn, account };
};

export { loginClientSide, registerClientSide, postLogin, logout };
