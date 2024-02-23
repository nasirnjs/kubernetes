import { Button, Input, Modal, Select, Switch } from "antd";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  IBus,
  createBusApi,
  deleteBus,
  getAllBuses,
  toggleBusAvailable,
  updateBusApi,
} from "../../../api/busApi";
import { openNotification } from "../../atoms/Notification";
import { Title } from "../../atoms/Title";
import { DeleteFilled, DeleteOutlined, EditFilled } from "@ant-design/icons";

const MainContentWrapper = styled.div`
  display: flex;
  flex-flow: column;
  gap: 1rem;
`;
const RouteWrapper = styled.div`
  display: flex;
  flex-flow: column;
  width: 90%;
  padding: 1rem;
  background: rgb(253, 247, 247);
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
`;
const CardWrapper = styled.div`
  display: flex;
  width: 80%;
  height: 75vh;
  flex-flow: column;
  padding: 1rem 0;
  gap: 1rem;
  overflow-y: scroll;
`;

const TopContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ActionWrapper = styled.div``;
const BottomContent = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const initialBusData: IBus = {
  _id: "",
  busName: "",
  numberOfSeat: "",
};
const BusManagement = () => {
  const [buses, setBuses] = useState<IBus[]>();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isSwitchLoading, setIsSwitchLoading] = useState<string>();
  const [busData, setBusData] = useState<IBus | undefined>(initialBusData);
  const [openModal, setOpenModal] = useState<{
    mode: "edit" | "add" | "delete";
    busId: string;
  }>();

  const onSubmitButton = () => {
    const { _id, isAvailableForTrip, ...updatedBusData } = busData as IBus;
    setIsLoading(true);
    (openModal?.mode === "add"
      ? createBusApi(updatedBusData)
      : openModal?.mode === "edit"
      ? updateBusApi({
          _id: busData?._id || "",
          busName: busData?.busName || "",
          numberOfSeat: busData?.numberOfSeat || "",
          busType: busData?.busType || undefined,
        })
      : deleteBus(openModal?.busId || "")
    )
      .then((resp) => {
        if (openModal?.mode === "edit") {
          setBuses(
            (prev) =>
              prev?.map((bus) => {
                if (bus._id === openModal.busId) {
                  return {
                    ...bus,
                    busName: busData?.busName || "",
                    numberOfSeat: busData?.numberOfSeat || "",
                    busType: busData?.busType,
                  };
                } else return bus;
              })
          );
        } else if (openModal?.mode === "add") {
          setBuses((prev) =>
            prev ? [...prev, resp.data.createdBus] : [resp.data.createdBus]
          );
        } else {
          setBuses(
            (prev) => prev?.filter((bus) => bus._id !== openModal?.busId)
          );
        }
        setOpenModal(undefined);
        setBusData(initialBusData);
        openNotification({
          type: "success",
          message: `Successfully ${
            openModal?.mode === "add"
              ? "Created"
              : openModal?.mode === "edit"
              ? "Updated"
              : "Deleted"
          }`,
        });
      })
      .catch((err) => {
        openNotification({
          type: "error",
          message: err.response?.data?.message || err.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleToggleChange = async (busId: string, e: any) => {
    setIsSwitchLoading(busId);
    try {
      await toggleBusAvailable(busId);
      setBuses(
        (prev) =>
          prev?.map((bus) => {
            if (bus._id === busId)
              return {
                ...bus,
                isAvailableForTrip: e,
              };
            return bus;
          })
      );
      openNotification({
        type: "success",
        message: "Toggle success",
      });
      setIsSwitchLoading(undefined);
    } catch (err: any) {
      setIsSwitchLoading(undefined);
      openNotification({
        type: "error",
        message: err.response?.data?.message || err.message,
      });
    }
  };

  const handleBusChange = (name: keyof IBus, value: string) => {
    setBusData((prev) => {
      if (!prev) return undefined;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  useEffect(() => {
    const getBuses = async () => {
      try {
        const { data } = await getAllBuses();
        setBuses(data.getBuses);
      } catch (err: any) {
        openNotification({
          type: "error",
          message: err.response?.data?.message || err.message,
        });
      }
    };
    getBuses();
  }, []);

  return (
    <MainContentWrapper>
      <div>
        <Button
          type="primary"
          onClick={() => setOpenModal({ busId: "", mode: "add" })}
        >
          Add Bus
        </Button>
      </div>
      <CardWrapper>
        {buses?.length &&
          buses.map((bus) => (
            <RouteWrapper key={bus._id}>
              <TopContainer>
                <Title font_size="1rem" font_weight={600}>
                  {bus.busName}
                </Title>
                <ActionWrapper>
                  <Button
                    type="link"
                    icon={<EditFilled />}
                    onClick={() => {
                      setOpenModal({ busId: bus._id, mode: "edit" });
                      setBusData(bus);
                    }}
                  />
                  <Button
                    onClick={() => {
                      setOpenModal({ busId: bus._id, mode: "delete" });
                    }}
                    danger
                    type="link"
                    icon={<DeleteFilled />}
                  />
                </ActionWrapper>
              </TopContainer>
              <Title font_size="1rem">{bus.numberOfSeat}&nbsp;Seats</Title>
              <Title font_size="1rem">
                {bus.busType === "ac" ? "AC" : "Non AC"}&nbsp;Coach
              </Title>
              <BottomContent>
                <Title>Ready for trip:</Title>
                <Switch
                  loading={isSwitchLoading === bus._id}
                  checked={bus.isAvailableForTrip}
                  onChange={(e) => handleToggleChange(bus._id, e)}
                  size="small"
                />
              </BottomContent>
            </RouteWrapper>
          ))}
      </CardWrapper>
      {/* Delete Bus */}
      <Modal
        open={openModal && openModal.mode === "delete" ? true : false}
        okText="Yes, please"
        confirmLoading={isLoading}
        onCancel={() => setOpenModal(undefined)}
        title={<Title>Are you sure you want to delete?</Title>}
        onOk={onSubmitButton}
      />
      {/* Add or edit Bus */}
      <Modal
        open={openModal && !(openModal.mode === "delete") ? true : false}
        confirmLoading={isLoading}
        onOk={onSubmitButton}
        onCancel={() => {
          setOpenModal(undefined);
          setBusData(initialBusData);
        }}
        okText={`${openModal?.mode === "edit" ? "Update" : "Create"}`}
        title={
          <Title>{openModal?.mode === "add" ? "Add" : "Update"}&nbsp;Bus</Title>
        }
      >
        <div>
          <Title font_size="1.15rem">Bus Name: </Title>
          <Input
            value={busData?.busName}
            onChange={(e) => handleBusChange("busName", e.target.value)}
          />
        </div>
        <div>
          <Title font_size="1.15rem">Coach type: </Title>
          <Select
            options={[
              { label: "AC", value: "ac" },
              { label: "Non AC", value: "non_ac" },
            ]}
            style={{ width: "30%" }}
            value={busData?.busType}
            onChange={(e) => handleBusChange("busType", e)}
          />
        </div>
        <div>
          <Title font_size="1.15rem">Number of seat: </Title>
          <Input
            value={busData?.numberOfSeat}
            onChange={(e) => handleBusChange("numberOfSeat", e.target.value)}
          />
        </div>
      </Modal>
    </MainContentWrapper>
  );
};
export default BusManagement;
