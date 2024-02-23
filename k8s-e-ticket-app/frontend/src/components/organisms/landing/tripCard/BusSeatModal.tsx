import { Button, Input, Modal } from "antd";
import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { Title } from "../../../atoms/Title";
import Image from "next/image";
import steeringWheelPng from "../../../../assets/pngs/steering-wheel.png";
import { IPassengers, ITrip } from "./TripCard";
import { IPassentersInfo } from "../../../templates/LandingPageMain";
import ResultAlert from "../../../molecules/ResultAlert";

const SeatBoxWrapper = styled(Button)<{
  is_selected?: boolean;
}>`
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${({ is_selected }) => (is_selected ? "white" : "#d2d8d6")};
  background-image: ${({ is_selected }) =>
    `linear-gradient(315deg,${
      is_selected ? "teal" : "#d2d8d6"
    }  0%, #dce8e0 74%)`};
  border-radius: 5px;
`;

const SeatBox = (value: any, isSelected?: boolean, isDisabled?: boolean) => {
  return (
    <SeatBoxWrapper disabled={isDisabled} is_selected={isSelected}>
      <Title
        color={isDisabled ? "#c2bfbf" : undefined}
        font_size="1.15rem"
        font_weight={600}
      >
        {value}
      </Title>
    </SeatBoxWrapper>
  );
};

const StyledModal = styled(Modal)<{ is_footer?: boolean }>`
  .ant-modal-footer {
    display: ${({ is_footer }) => (is_footer ? "block" : "none")};
  }
`;

const ModalBody = styled.div`
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-row-gap: 1rem;
  grid-column-gap: 1rem;
  padding: 2% 17%;
  border-radius: 20px;
  background: #f4f4f4;
`;

const SeatBoxMain = styled.div<{ extra_space?: boolean }>`
  margin-right: ${({ extra_space }) => (extra_space ? "2.5rem" : "0")};
`;

const ImageWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  margin: 1.25rem 2rem .5rem 0;
`;

const SlipWrapper = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
  justify-content: space-between;
`;

const SecondStepWrapper = styled.div`
  margin-top: 2rem;
`;

interface IProps {
  tripBusDetails?: ITrip;
  isModalOpen?: boolean;
  selectedSeats: number[] | undefined;
  confirmTripInfo: IPassentersInfo;
  loading?: boolean;
  steps: number;
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  onCloseTripModal: () => void;
  onConfirmTripSubmit: (totalAmount: string, tripId: string) => void;
  setSelectedSeats: (seatNumber: number) => void;
  onConfirmTripChange: (name: keyof IPassentersInfo, value: string) => void;
}
const BusSeatModal: React.FC<IProps> = ({
  isModalOpen,
  tripBusDetails,
  selectedSeats,
  confirmTripInfo,
  loading,
  steps,
  setSteps,
  onConfirmTripSubmit,
  onCloseTripModal,
  setSelectedSeats,
  onConfirmTripChange,
}) => {
  const seatList = Array.from(
    {
      length: tripBusDetails?.numberOfSeat || 0,
    },
    (_, index) => index + 1
  );

  const isSelected = useCallback(
    (index: number) => {
      if (!!selectedSeats?.find((data) => data === index)) return true;
      return false;
    },
    [selectedSeats]
  );

  const isDisabled = useCallback(
    (index: number) => {
      if (
        !!tripBusDetails?.passengers.find((data) =>
          data.seatNumbers.find((seat) => seat === String(index))
        )
      )
        return true;
      return false;
    },
    [tripBusDetails?.passengers]
  );

  const onOk = () => {
    setSteps((prev) => prev + 1);
    if (steps > 0) {
      onConfirmTripSubmit(
        String((selectedSeats?.length || 0) * Number(tripBusDetails?.price)),
        tripBusDetails?._id || ""
      );
    }
  };

  return (
    <StyledModal
      confirmLoading={steps > 0 && loading}
      open={isModalOpen}
      okText={steps === 0 ? "Next" : "Submit"}
      onOk={onOk}
      onCancel={() => {
        onCloseTripModal();
        setSteps(0);
      }}
      is_footer={steps < 2 || loading ? true : false}
      destroyOnClose
    >
      {steps === 0 ? (
        <>
          <ImageWrapper>
            <Image
              src={steeringWheelPng}
              alt="steeringWheelPng"
              height={70}
              width={70}
            />
          </ImageWrapper>
          <ModalBody>
            {seatList?.map((data) => (
              <SeatBoxMain
                onClick={() => setSelectedSeats(data)}
                extra_space={
                  Number(data) % 2 === 0 && Number(data) % 4 !== 0
                    ? true
                    : undefined
                }
                key={data}
              >
                {SeatBox(data, isSelected(data), isDisabled(data))}
              </SeatBoxMain>
            ))}
          </ModalBody>
        </>
      ) : steps === 1 || loading ? (
        <SecondStepWrapper>
          <SlipWrapper>
            <Title font_size="1.25rem" font_weight={600}>
              Seat Numbers: {selectedSeats?.join(", ")}
            </Title>
            <Title font_size="1.25rem" font_weight={600}>
              Total amount:{" "}
              {(selectedSeats?.length || 0) * Number(tripBusDetails?.price)}
              &nbsp;Tk
            </Title>
            <Title font_size="1rem" color="red">
              Pay your bill on <b>01987250620</b>
            </Title>
          </SlipWrapper>
          <div>
            <Title font_size="1.15rem">Name: </Title>
            <Input
              value={confirmTripInfo.name}
              onChange={(e) => onConfirmTripChange("name", e.target.value)}
            />
          </div>
          <div>
            <Title font_size="1.15rem">BKash number: </Title>
            <Input
              value={confirmTripInfo.phone}
              onChange={(e) => onConfirmTripChange("phone", e.target.value)}
            />
          </div>
          <div>
            <Title font_size="1.15rem">Email: </Title>
            <Input
              value={confirmTripInfo.email}
              onChange={(e) => onConfirmTripChange("email", e.target.value)}
            />
          </div>
          <div>
            <Title font_size="1.15rem">Transaction ID: </Title>
            <Input
              value={confirmTripInfo.transactionId}
              onChange={(e) =>
                onConfirmTripChange("transactionId", e.target.value)
              }
            />
          </div>
        </SecondStepWrapper>
      ) : (
        <ResultAlert
          status="success"
          title="Successfully purchase ticket"
          subTitle="We have sent you ticket by mail. Please check your mail."
        />
      )}
    </StyledModal>
  );
};

export default BusSeatModal;
