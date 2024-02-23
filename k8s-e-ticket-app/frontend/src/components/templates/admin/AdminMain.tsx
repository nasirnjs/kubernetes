import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Header from "../../organisms/landing/header/Header";
import { Divider, Tabs } from "antd";
import BusManagement from "../../organisms/admin/BusManagement";
import { TripManagement } from "../../organisms/admin/TripManagement";
import RouteManagement from "../../organisms/admin/RouteManagement";
import { getRouteListApi } from "../../../api/routeApi";

const AdminContainer = styled.div`
  width: 100%;
`;

const Wrapper = styled.div`
  padding: 0 15%;
`;

const StyledTab = styled(Tabs)`
  width: 100%;
  .ant-tabs-tab-btn {
    font-size: 1rem;
  }
`;

const tabs = [
  { title: "Bus Management", type: "bus", component: <BusManagement /> },
  { title: "Trip Management", type: "trip", component: <TripManagement /> },
  { title: "Route Management", type: "route", component: <RouteManagement /> },
];

const AdminMain = () => {
  return (
    <AdminContainer>
      <Header />
      <Divider />
      <Wrapper>
        <StyledTab
          tabPosition="left"
          items={tabs.map((data) => {
            return {
              label: data.title,
              key: data.title,
              children: data.component,
            } as any;
          })}
        />
      </Wrapper>
    </AdminContainer>
  );
};

export default AdminMain;
