import React, { useCallback, useState } from "react";
import styled from "styled-components";
import Header from "../organisms/landing/header/Header";
import { Button, Divider } from "antd";
import AutoCompleteInput from "../atoms/AutoCompleteInput";
import {
  IConfirmTrip,
  confirmTripApi,
  getRouteApi,
  getTripDetailsApi,
} from "../../api/trip";
import { openNotification } from "../atoms/Notification";
import InputWithLabel from "../molecules/InputWithLabel";
import TripCard, { ITrip } from "../organisms/landing/tripCard/TripCard";
import BusSeatModal from "../organisms/landing/tripCard/BusSeatModal";
import ResultAlert from "../molecules/ResultAlert";

const MainContainer = styled.div`
  display: flex;
  flex-flow: column;
  padding-top: 1rem;
  height: 96vh;
  background-color: #f1dfd1;
  background-image: linear-gradient(315deg, #f1dfd1 0%, #f6f0ea 74%);
`;

const CustomButton = styled(Button)`
  height: 2.8rem !important;
  width: 8rem !important;
`;

const FlexContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
`;

const TripWrapper = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-flow: column;
  gap: 12px;
  align-items: center;
  overflow-y: scroll;
`;

export interface IPassentersInfo {
  name: string;
  email: string;
  phone: string;
  transactionId: string;
}

const initialPassengersInfo: IPassentersInfo = {
  name: "",
  email: "",
  phone: "",
  transactionId: "",
};

const LandingPageMain = () => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>();
  const [routes, setRoutes] = useState<{ from?: string; to?: string }>();
  const [isOpenSeatModal, setIsOpenSeatModal] = useState(false);
  const [selectedTripIndex, setSelectedTripIndex] = useState<number>();
  const [trip, setTrip] = useState<ITrip[]>();
  const [selectedSeats, setSelectedSeats] = useState<number[]>();
  const [steps, setSteps] = useState(0);
  const [confirmTripInfo, setConfirmTripInfo] = useState<IPassentersInfo>(
    initialPassengersInfo
  );
  const [loading, setLoading] = useState(false);

  const onSubmitButton = async () => {
    setLoading(true);
    try {
      const { data } = await getTripDetailsApi(
        routes?.from || "",
        routes?.to || ""
      );
      setTrip(data);
      setLoading(false);
    } catch (err: any) {
      openNotification({
        type: "error",
        message: err.response?.data?.message || err.message,
      });
      setLoading(false);
    }
  };

  const onSearch = useCallback(
    async (searchValue: string) => {
      try {
        const { data } = await getRouteApi(searchValue);
        setOptions(
          data.response?.map((d: { locationName: string; _id: string }) => ({
            label:
              d.locationName.charAt(0).toUpperCase() + d.locationName.slice(1),
            value: d._id,
          }))
        );
      } catch (err: any) {
        openNotification({
          type: "error",
          message: err.response?.data?.message || err.message,
        });
      }
    },
    [setOptions]
  );

  const onSelect = async (name: "from" | "to", string: string) => {
    setRoutes((prev) =>
      prev ? { ...prev, [name]: string } : { [name]: string }
    );
  };

  const onClickTripCard = (index: number) => {
    setIsOpenSeatModal(true);
    setSelectedTripIndex(index);
  };

  const onSelectSeat = (seatNumber: number) => {
    let temSeats = selectedSeats ? [...selectedSeats] : undefined;
    const index = temSeats?.findIndex((data) => data === seatNumber);
    if (index === -1 || index === undefined) {
      temSeats = temSeats ? [...temSeats, seatNumber] : [seatNumber];
    } else {
      temSeats = temSeats?.filter((d) => d !== seatNumber);
    }
    setSelectedSeats(temSeats);
  };

  const onConfirmTripChange = (name: keyof IPassentersInfo, value: string) => {
    setConfirmTripInfo((prev) => ({ ...prev, [name]: value }));
  };

  const onConfirmTripSubmit = async (totalAmount: string, tripId: string) => {
    setLoading(true);
    try {
      const { data } = await confirmTripApi({
        ...confirmTripInfo,
        seatNumbers: selectedSeats,
        totalAmount,
        tripId,
      });
      setTrip(data.getTrip);
      setSelectedSeats(undefined);
      setConfirmTripInfo(initialPassengersInfo);
      setSelectedTripIndex(undefined);
      setOptions(undefined);
      setLoading(false);
      setSteps(2);
    } catch (err: any) {
      openNotification({
        type: "error",
        message: err.response?.data?.message || err.message,
      });
      setLoading(false);
    }
  };

  return (
    <MainContainer>
      <Header />
      <Divider />
      <FlexContainer>
        <InputWithLabel
          onSearch={onSearch}
          label="From"
          value={routes?.from}
          placeholder="Ex: Dhaka"
          onSelect={(value) => onSelect("from", value)}
          options={options || []}
        />
        <InputWithLabel
          onSearch={onSearch}
          label="To"
          value={routes?.to}
          placeholder="Ex: Gazipur"
          onSelect={(value) => onSelect("to", value)}
          options={options || []}
        />
        <CustomButton
          loading={loading}
          type="primary"
          size="large"
          onClick={onSubmitButton}
        >
          Search
        </CustomButton>
      </FlexContainer>
      <TripWrapper>
        {trip?.length &&
          trip.map((data, idx) => (
            <TripCard
              onClickTripCard={onClickTripCard}
              key={idx}
              index={idx}
              data={data}
            />
          ))}
      </TripWrapper>
      <BusSeatModal
        tripBusDetails={
          trip?.length && selectedTripIndex !== undefined
            ? trip[selectedTripIndex]
            : undefined
        }
        onCloseTripModal={() => {
          setIsOpenSeatModal(false);
          setSelectedSeats(undefined);
        }}
        setSteps={setSteps}
        steps={steps}
        isModalOpen={isOpenSeatModal}
        setSelectedSeats={onSelectSeat}
        selectedSeats={selectedSeats}
        onConfirmTripChange={onConfirmTripChange}
        confirmTripInfo={confirmTripInfo}
        onConfirmTripSubmit={onConfirmTripSubmit}
        loading={loading}
      />
    </MainContainer>
  );
};

export default LandingPageMain;
