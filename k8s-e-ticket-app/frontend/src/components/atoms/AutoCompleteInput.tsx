import React from "react";
import { AutoComplete, Select } from "antd";
import styled from "styled-components";

const StyledAutoComplete = styled(Select)`
  height: 3rem;
`;

interface IProps {
  options?: { label: string; value: string }[];
  value?: string;
  placeholder?: string;
  onSearch: (value: string) => void;
  onSelect: (value: any) => void;
}
const AutoCompleteInput: React.FC<IProps> = ({
  options,
  placeholder,
  onSearch,
  onSelect,
  value,
}) => {
  return (
    <StyledAutoComplete
      showSearch
      value={value}
      filterOption={false}
      style={{ width: 250 }}
      placeholder={placeholder}
      options={options}
      onSelect={onSelect}
      onSearch={onSearch}
    />
  );
};

export default AutoCompleteInput;
