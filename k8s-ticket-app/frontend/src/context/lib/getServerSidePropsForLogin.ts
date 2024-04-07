import { GetServerSidePropsContext } from "next";
// import Cookies from "cookies";
import jwt from "jsonwebtoken";
const secret = "zIErateLeHILi$$$maNtaCKELant!@%EOunCETeNUmisMarcABySTrAc";

const redirectToDashboard = {
  redirect: {
    destination: "/admin",
    permanent: false,
  },
};

const getServerSidePropsForLoginDashboard = async (
  context: GetServerSidePropsContext
) => {
  const allCookies = context.req.cookies;
  const accessCookie = allCookies.access_token;
  if (accessCookie) {
    try {
      const token = accessCookie.split(" ");      
      const verifyToken = jwt.verify(token[0], secret);
      if (verifyToken) {
        return redirectToDashboard;
      }
    } catch (err: any) {}
  }

  return {
    props: {},
  };
};

export default getServerSidePropsForLoginDashboard;
