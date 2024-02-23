import React from "react";
import { Result } from "antd";
import { ResultStatusType } from "antd/es/result";

interface IProps {
  status: ResultStatusType;
  title: string;
  subTitle: string;
  extra?: React.ReactNode;
}
const ResultAlert: React.FC<IProps> = ({ status, subTitle, title, extra }) => (
  <Result status={status} title={title} subTitle={subTitle} extra={extra} />
);

export default ResultAlert;
