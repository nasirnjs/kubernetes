import React, { useState } from "react";
import styled from "styled-components";
import { Input, Button, Form } from "antd";
import { useAuthContext } from "../../context/AuthContext";
import getServerSideProps from "../../context/lib/getServerSidePropsForLogin";
import Head from "next/head";
import Header from "../../components/organisms/landing/header/Header";

const LoginPage = styled.div`
  height: 100vh;
  display: flex;
  flex-flow: column;
  gap: 3rem;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
`;

const LoginForm = styled(Form)`
  width: 400px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`;

const StyledInput = styled(Input)``;

const StyledButton = styled(Button)`
  width: 100%;
`;

const FancyLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginAdminApiAction } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleUsernameChange = (e: any) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await loginAdminApiAction({ email: username, password });
    } catch (err: any) {
      console.log("err.m", err.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <LoginPage>
      <Head>
        <title>Login</title>
      </Head>
      <Header />
      <LoginForm onFinish={handleSubmit}>
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Login</h2>
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <StyledInput
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <StyledInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
        </Form.Item>
        <Form.Item>
          <StyledButton loading={isLoading} type="primary" htmlType="submit">
            Log In
          </StyledButton>
        </Form.Item>
      </LoginForm>
    </LoginPage>
  );
};

export { getServerSideProps };

export default FancyLogin;
