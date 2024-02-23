import { notification } from "antd";

interface INotification {
  type: "success" | "info" | "warning" | "error";
  message?: string;
  description?: string;
}
export const openNotification = (data: INotification) => {
  notification.open({
    message: data.message,
    description: data.description,
    type: data.type,
  });
};
