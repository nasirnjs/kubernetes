import { GetServerSidePropsContext } from "next";
// import Cookies from "cookies";
import jwt from "jsonwebtoken";
const secret = "zIErateLeHILi$$$maNtaCKELant!@%EOunCETeNUmisMarcABySTrAc";

const redirectToLogin = {
  redirect: {
    destination: "/login",
    permanent: false,
  },
};

const getServerSidePropsForAdminDashboard = async (
  context: GetServerSidePropsContext
) => {
  const allCookies = context.req.cookies;
  const accessCookie = allCookies.access_token;

  if (accessCookie) {
    try {
      const token = accessCookie.split(" ");
      const verifyToken = jwt.verify(token[0], secret);
      if (verifyToken) {
        return {
          props: {
            isAuthenticated: true,
          },
        };
      }
    } catch (err: any) {
      return redirectToLogin;
    }
  } else {
    return redirectToLogin;
  }
};

export default getServerSidePropsForAdminDashboard;
