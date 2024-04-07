import React from "react";
import AdminMain from "../../components/templates/admin/AdminMain";
import Head from "next/head";
import getServerSideProps from "../../context/lib/getServerSidePropsForAdmin";

const AdminPage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Head>
        <title>Admin</title>
      </Head>
      <AdminMain />
    </div>
  );
};

export { getServerSideProps };

export default AdminPage;
