import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  createRouteApi,
  deleteRouteApi,
  getRouteListApi,
  updateRouteApi,
} from "../../../api/routeApi";
import { Title } from "../../atoms/Title";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Input, Modal } from "antd";
import { openNotification } from "../../atoms/Notification";

const MainContainer = styled.div`
  width: 80%;
  display: flex;
  flex-flow: column;
  gap: 1rem;
`;

const CardWrapper = styled.div`
  display: flex;
  width: 80%;
  height: 75vh;
  flex-flow: column;
  gap: 1rem;
  overflow-y: scroll;
`;

const RouteWrapper = styled.div`
  display: flex;
  width: 90%;
  height: 2.5rem;
  padding: 1rem;
  background: rgb(253, 247, 247);
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
  justify-content: space-between;
  align-items: center;
`;
const ModifyWrapper = styled.div`
  display: flex;
  gap: 1rem;
`;

export interface IRoutes {
  _id: string;
  locationName: string;
}

const RouteManagement = () => {
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isModal, setIsModal] = useState<{ type: "create" | "update" }>();
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [routeName, setRouteName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<IRoutes[]>();

  const handleCreateRoute = async () => {
    setIsLoading(true);
    try {
      const { data } = await createRouteApi(routeName);
      setIsLoading(false);
      setRouteName("");
      setIsModal(undefined);
      openNotification({
        type: "success",
        message: "Route Created",
      });
      setRoutes(data.response);
    } catch (err: any) {
      setIsLoading(false);
      openNotification({
        type: "error",
        message: err.response?.data?.message || err.message,
      });
    }
  };

  const handleDeleteRoute = async () => {
    if (!selectedRouteId) return;
    setIsLoading(true);
    try {
      const { data } = await deleteRouteApi(selectedRouteId);
      setSelectedRouteId("");
      setIsLoading(false);
      setIsDeleteModal(false);
      openNotification({
        type: "success",
        message: "Route Deleted",
      });
      setRoutes(data.response);
    } catch (err: any) {
      setIsLoading(false);
      openNotification({
        type: "error",
        message: err.response?.data?.message || err.message,
      });
    }
  };

  const handleUpdateRoute = async () => {
    if (!selectedRouteId) return;
    setIsLoading(true);
    try {
      const { data } = await updateRouteApi(selectedRouteId, routeName);
      openNotification({
        type: "success",
        message: "Route Updated",
      });
      setSelectedRouteId("");
      setIsLoading(false);
      setRouteName("");
      setIsModal(undefined);
      setRoutes(data.response);
    } catch (err: any) {
      setIsLoading(false);
      openNotification({
        type: "error",
        message: err.response?.data?.message || err.message,
      });
    }
  };

  useEffect(() => {
    const getRoutes = async () => {
      try {
        const { data } = await getRouteListApi();
        setRoutes(data.response);
      } catch (err: any) {
        openNotification({
          type: "error",
          message: err.response?.data?.message || err.message,
        });
      }
    };
    getRoutes();
  }, []);

  const firstCharIsCapital = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  return (
    <MainContainer>
      <div>
        <Button onClick={() => setIsModal({ type: "create" })} type="primary">
          Add Route
        </Button>
      </div>
      <CardWrapper>
        {routes?.length &&
          routes.map((route) => (
            <RouteWrapper key={route._id}>
              <Title font_size="1rem">
                {firstCharIsCapital(route.locationName)}
              </Title>
              <ModifyWrapper>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setIsModal({ type: "update" });
                    setSelectedRouteId(route._id);
                    setRouteName(route.locationName);
                  }}
                >
                  <EditOutlined />
                </div>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedRouteId(route._id);
                    setIsDeleteModal(true);
                  }}
                >
                  <DeleteOutlined />
                </div>
              </ModifyWrapper>
            </RouteWrapper>
          ))}
      </CardWrapper>

      {/* delete modal */}
      <Modal
        confirmLoading={isLoading}
        title={<Title>Are your sure you want to delete?</Title>}
        open={isDeleteModal}
        onOk={handleDeleteRoute}
        onCancel={() => {
          setIsDeleteModal(false);
          setSelectedRouteId("");
          setRouteName("");
        }}
        okText="Yes, please"
      />
      {/* Add/Edit modal */}
      <Modal
        open={!!isModal?.type}
        confirmLoading={isLoading}
        okText={`${isModal?.type === "create" ? "Add" : "Update"}`}
        onCancel={() => {
          setIsModal(undefined);
          setSelectedRouteId("");
          setRouteName("");
        }}
        onOk={
          isModal?.type === "update" ? handleUpdateRoute : handleCreateRoute
        }
        title={
          <Title>
            {isModal?.type === "create" ? "Add" : "Edit"}&nbsp;Route
          </Title>
        }
      >
        <Input
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
        />
      </Modal>
    </MainContainer>
  );
};

export default RouteManagement;
