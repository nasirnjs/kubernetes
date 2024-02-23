import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  ITripCreate,
  createTripApi,
  deleteTripApi,
  getAllTripsApi,
  tripCancellationApi,
  updateTripApi,
} from "../../../api/adminTripApi";
import { openNotification } from "../../atoms/Notification";
import { Button, DatePicker, Input, Modal, Select, Table } from "antd";
import { Title } from "../../atoms/Title";
import {
  DeleteFilled,
  DeleteOutlined,
  EditFilled,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getAllBuses } from "../../../api/busApi";
import { getRouteListApi } from "../../../api/routeApi";
import { ColumnsType } from "antd/es/table";

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column;
  gap: 1rem;
`;

const StyledModal = styled(Modal)`
  width: 650px !important;
`;

const TripWrapper = styled.div`
  display: flex;
  flex-flow: column;
  width: 90%;
  padding: 1rem;
  background: rgb(253, 247, 247);
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
  gap: 0.5rem;
`;

const SeatWrapper = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
  border: 1px solid gray;
  border-radius: 5px;
  padding: 2px;
`;

const SeatsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin: 1.5rem 0 0 0;
  gap: 0.25rem;
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

const TopWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const initialTrip: ITripCreate = {
  busId: "",
  fromId: "",
  price: "",
  toId: "",
};
interface ITrip {
  _id: string;
  busId: string;
  busName: string;
  fromId: string;
  from: string;
  toId: string;
  to: string;
  price: string;
  departure_time: Date;
  passengers: {
    name: string;
    phoneNumber: string;
    seatNumbers: string[];
    _id: string;
  }[];
}
export const TripManagement = () => {
  const [trips, setTrips] = useState<ITrip[]>();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [buses, setBuses] = useState<{ label: string; value: string }[]>();
  const [routes, setRoutes] = useState<{ label: string; value: string }[]>();
  const [tripData, setTripData] = useState<ITripCreate>(initialTrip);
  const [passengerTripCancellationModal, setPassengerTripCancellationModal] =
    useState<{
      tripId: string;
      passengerId: string;
      seatNumbers: string[];
    }>();
  const [openModal, setOpenModal] = useState<{
    mode: "edit" | "add" | "delete";
    tripId: string;
  }>();
  const [openPassengerModal, setOpenPassengerModal] = useState<string>();

  const onTripCreateChange = (name: keyof ITripCreate, value: any) => {
    setTripData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUpdateTrip = async () => {
    const { data: busData } = await getAllBuses();
    const { data: routeData } = await getRouteListApi();
    setBuses(
      busData?.getBuses?.map(
        (bus: { _id: string; busType: string; busName: string }) => ({
          label: `${bus.busName} - ${bus.busType === "ac" ? "AC" : "Non AC"}`,
          value: bus._id,
        })
      )
    );
    setRoutes(
      routeData?.response?.map(
        (route: { _id: string; locationName: string }) => ({
          label: route.locationName,
          value: route._id,
        })
      )
    );
  };

  const onSubmitButton = async () => {
    try {
      setIsLoading(true);
      const { data } = await createTripApi(tripData);
      openNotification({
        type: "success",
        message: "Successfully created trip",
      });
      setTrips((prev) =>
        prev ? [...prev, { ...data.createTrip }] : [{ ...data.createTrip }]
      );
      setIsLoading(false);
      setTripData(initialTrip);
      setOpenModal(undefined);
    } catch (err: any) {
      setIsLoading(false);
      openNotification({
        type: "error",
        message: err.response?.data?.message || err.message,
      });
    }
  };

  const onDeleteSubmit = async (tripId: string) => {
    try {
      setIsLoading(true);
      await deleteTripApi(tripId);
      openNotification({
        type: "success",
        message: "Successfully Deleted trip",
      });
      setTrips((prev) => prev?.filter((trip) => trip._id !== tripId));
      setIsLoading(false);
      setOpenModal(undefined);
    } catch (err: any) {
      setIsLoading(false);
      openNotification({
        type: "error",
        message: err.response?.data?.message || err.message,
      });
    }
  };

  const onUpdateSubmit = async () => {
    if (!openModal?.tripId) return;
    try {
      setIsLoading(true);
      const { data } = await updateTripApi({
        ...tripData,
        _id: openModal.tripId,
      });
      openNotification({
        type: "success",
        message: "Successfully updated trip",
      });
      setTrips(
        (prev) =>
          prev?.map((trip) => {
            if (trip._id === openModal?.tripId) {
              return data.tripDoc;
            } else return trip;
          })
      );
      setIsLoading(false);
      setTripData(initialTrip);
      setOpenModal(undefined);
    } catch (err: any) {
      setIsLoading(false);
      openNotification({
        type: "error",
        message: err.response?.data?.message || err.message,
      });
    }
  };

  useEffect(() => {
    const getTrips = async () => {
      try {
        const { data } = await getAllTripsApi();
        setTrips(data.getTrips);
      } catch (err: any) {
        openNotification({
          type: "error",
          message: err.response?.data?.message || err.message,
        });
      }
    };
    getTrips();
  }, [setTrips]);

  const firstCharIsCapital = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const columns: ColumnsType = [
    {
      title: "Name",
      dataIndex: "name",
      width: 150,
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      width: 150,
    },
    {
      title: "Seat Number(s)",
      dataIndex: "seatNumbers",
    },
    {
      title: "Action",
      dataIndex: "passengerEditInfo",
      render: ({ tripId, passengerId, seatNumbers }) => (
        <Button
          style={{ border: "none" }}
          icon={<EditOutlined />}
          onClick={() => {
            setPassengerTripCancellationModal({
              tripId,
              passengerId,
              seatNumbers,
            });
          }}
        />
      ),
    },
  ];

  const onCancelConfirm = async () => {
    if (!passengerTripCancellationModal) return;
    setIsLoading(true);
    try {
      const { passengerId, seatNumbers, tripId } =
        passengerTripCancellationModal;
      const { data } = await tripCancellationApi(
        tripId,
        passengerId,
        seatNumbers
      );

      setTrips((prev) => {
        if (prev) {
          return prev.map((trip) =>
            trip._id === passengerTripCancellationModal.tripId
              ? data.tripDoc
              : trip
          );
        }
      });

      openNotification({
        type: "success",
        message: "Trip cancellation success",
      });
      setPassengerTripCancellationModal(undefined);
    } catch (err: any) {
      openNotification({
        type: "error",
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContentWrapper>
      <div>
        <Button
          type="primary"
          onClick={() => {
            handleCreateUpdateTrip();
            setOpenModal({ tripId: "", mode: "add" });
          }}
        >
          Create Trip
        </Button>
      </div>
      <CardWrapper>
        {trips?.length &&
          trips.map((trip) => (
            <TripWrapper key={trip._id}>
              <TopWrapper>
                <Title font_size="1.15rem" font_weight={600}>
                  {trip.busName}
                </Title>
                <Title color="gray" font_weight={600} font_size=".9rem">
                  {dayjs(trip.departure_time).format("dddd MMM DD - h:mm A")}
                </Title>
                <div>
                  <Button
                    type="link"
                    icon={<EditFilled />}
                    onClick={() => {
                      handleCreateUpdateTrip();
                      setOpenModal({ tripId: trip._id, mode: "edit" });
                      setTripData(trip);
                    }}
                  />
                  <Button
                    onClick={() => {
                      setOpenModal({ tripId: trip._id, mode: "delete" });
                    }}
                    danger
                    type="link"
                    icon={<DeleteFilled />}
                  />
                </div>
              </TopWrapper>
              <Title font_size="1rem" font_weight={500}>
                {firstCharIsCapital(trip.from)} - {firstCharIsCapital(trip.to)}
              </Title>
              <Title>Ticket Price: {trip.price} Tk</Title>
              <div>
                <Button
                  onClick={() => setOpenPassengerModal(trip._id)}
                  type="dashed"
                >
                  View passengers
                </Button>
              </div>
            </TripWrapper>
          ))}
      </CardWrapper>
      {/* trip cancellation modal */}
      <Modal
        open={!!passengerTripCancellationModal}
        okText="Confirm cancel"
        confirmLoading={isLoading}
        onOk={onCancelConfirm}
        onCancel={() => {
          setPassengerTripCancellationModal(undefined);
        }}
      >
        <SeatsContainer>
          {passengerTripCancellationModal?.seatNumbers?.map((seat) => (
            <SeatWrapper key={seat}>
              <Title>{seat}</Title>
              <Button
                size="small"
                danger
                onClick={() =>
                  setPassengerTripCancellationModal(
                    (prev) =>
                      prev && {
                        ...prev,
                        seatNumbers: prev.seatNumbers.filter(
                          (sn) => sn !== seat
                        ),
                      }
                  )
                }
                style={{ border: "0" }}
                icon={<DeleteFilled />}
              />
            </SeatWrapper>
          ))}
        </SeatsContainer>
      </Modal>

      {/* passengers modal */}
      <StyledModal
        onCancel={() => setOpenPassengerModal(undefined)}
        footer={false}
        open={!!openPassengerModal}
      >
        <Table
          style={{ paddingTop: "1.5rem" }}
          columns={columns as any}
          dataSource={trips
            ?.find((trip) => trip._id === openPassengerModal)
            ?.passengers.map((passenger, key) => ({
              key,
              ...passenger,
              seatNumbers: passenger.seatNumbers.join(", "),
              passengerEditInfo: {
                passengerId: passenger._id,
                tripId: openPassengerModal,
                seatNumbers: passenger.seatNumbers,
              },
            }))}
          pagination={false}
          scroll={{ y: 540 }}
        />
      </StyledModal>

      {/* Delete Bus */}
      <Modal
        open={openModal && openModal.mode === "delete" ? true : false}
        okText="Yes, please"
        confirmLoading={isLoading}
        onCancel={() => setOpenModal(undefined)}
        title={<Title>Are you sure you want to delete?</Title>}
        onOk={() => onDeleteSubmit(openModal?.tripId || "")}
      />

      {/* Add or edit Bus */}
      <Modal
        open={openModal && !(openModal.mode === "delete") ? true : false}
        confirmLoading={isLoading}
        onOk={() =>
          openModal?.mode === "add" ? onSubmitButton() : onUpdateSubmit()
        }
        onCancel={() => {
          setOpenModal(undefined);
          setTripData(initialTrip);
        }}
        okText={`${openModal?.mode === "edit" ? "Update" : "Create"}`}
        title={
          <Title>{openModal?.mode === "add" ? "Add" : "Update"}&nbsp;Bus</Title>
        }
      >
        <div>
          <Title font_size="1.15rem">Select bus: </Title>
          <Select
            placeholder="Select bus"
            value={tripData.busId || undefined}
            options={buses}
            style={{ width: "100%" }}
            onChange={(value) => {
              onTripCreateChange("busId", value);
            }}
          />
        </div>
        <div>
          <Title font_size="1.15rem">From: </Title>
          <Select
            placeholder="Select from route"
            value={tripData.fromId || undefined}
            options={routes}
            style={{ width: "100%" }}
            onChange={(value) => {
              onTripCreateChange("fromId", value);
            }}
          />
        </div>
        <div>
          <Title font_size="1.15rem">To: </Title>
          <Select
            placeholder="Select destination route"
            value={tripData.toId || undefined}
            options={routes}
            style={{ width: "100%" }}
            onChange={(value) => {
              onTripCreateChange("toId", value);
            }}
          />
        </div>
        <div>
          <Title font_size="1.15rem">Ticket price: </Title>
          <Input
            value={tripData.price || undefined}
            placeholder="Input ticket price"
            onChange={(e) => {
              onTripCreateChange("price", e.target.value);
            }}
          />
        </div>
        <div>
          <Title font_size="1.15rem">Set schedule: </Title>
          <DatePicker
            value={
              tripData.departure_time
                ? dayjs(tripData.departure_time)
                : undefined
            }
            showTime
            format="YYYY-MM-DD hh:mm:A"
            minuteStep={30 as any}
            placeholder="Select Date and Time"
            onChange={(value) => {
              onTripCreateChange("departure_time", value);
            }}
          />
        </div>
      </Modal>
    </ContentWrapper>
  );
};
