import React, { useEffect, useState } from "react";
import Select from "react-select";
import { apiService } from "../services/api";
import { Endpoint } from "../services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

interface Option {
  label: string;
  value: string;
}

const SELECT_ALL_VALUE = "__ALL__";

/* ------------------------------------------------------------
   SCROLLABLE DEVICE SELECT STYLES
------------------------------------------------------------ */
const deviceSelectStyles = {
  valueContainer: (base: any) => ({
    ...base,
    maxHeight: "120px",
    overflowY: "auto",
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
};

const AddPermissionModal: React.FC<Props> = ({ isOpen, onClose, onSaved }) => {
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [deviceOptions, setDeviceOptions] = useState<Option[]>([]);

  const [selectedUser, setSelectedUser] = useState<Option | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Option | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Option[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchGroups();
      resetState();
    }
  }, [isOpen]);

  /* ------------------------------------------------------------
      RESET
  ------------------------------------------------------------ */
  const resetState = () => {
    setSelectedUser(null);
    setSelectedGroup(null);
    setSelectedDevice([]);
    setDeviceOptions([]);
  };

  /* ------------------------------------------------------------
      LOAD DEVICES WHEN GROUP SELECTED
  ------------------------------------------------------------ */
  useEffect(() => {
    if (selectedGroup) {
      fetchDevices(selectedGroup.value);
    } else {
      setDeviceOptions([]);
      setSelectedDevice([]);
    }
  }, [selectedGroup]);

  /* ------------------------------------------------------------
      LOAD USERS
  ------------------------------------------------------------ */
  const fetchUsers = async () => {
    const res = await apiService.getRamanAnalysis(Endpoint.KEYCLOAK_USERS, {
      first: 0,
      max: 50,
    });

    if (Array.isArray(res?.data)) {
      setUserOptions(
        res.data.map((u: any) => ({
          label: u.username,
          value: u.id,
        }))
      );
    }
  };

  /* ------------------------------------------------------------
      LOAD GROUPS
  ------------------------------------------------------------ */
  const fetchGroups = async () => {
    const res = await apiService.getRamanAnalysis(Endpoint.GROUP_ALL);

    if (Array.isArray(res?.data)) {
      setGroupOptions(
        res.data.map((g: any) => ({
          label: g.name,
          value: g.id,
        }))
      );
    }
  };

  /* ------------------------------------------------------------
      LOAD DEVICES (WITH SELECT ALL)
  ------------------------------------------------------------ */
  const fetchDevices = async (groupId: string) => {
    const res = await apiService.getRamanAnalysis(Endpoint.GROUP_DEVICES, {
      id: groupId,
    });

    if (res?.data?.devices) {
      const devices: Option[] = res.data.devices.map((d: string) => ({
        label: d,
        value: d,
      }));

      setDeviceOptions([
        { label: "Select All Devices", value: SELECT_ALL_VALUE },
        ...devices,
      ]);
    }
  };

  /* ------------------------------------------------------------
      SAVE
  ------------------------------------------------------------ */
  const handleSave = async () => {
    if (!selectedUser) return alert("Select user");
    if (!selectedGroup) return alert("Select group");
    if (selectedDevice.length === 0) return alert("Select devices");

    const userId = selectedUser.value;

    const existingAccess = await apiService.getUserFullAccess(userId);

    const newEntry = {
      group_id: selectedGroup.value,
      group_name: selectedGroup.label,
      devices: selectedDevice.map((d) => d.value),
    };

    const mergedAccess = [
      ...existingAccess.filter(
        (a) => a.group_id !== newEntry.group_id
      ),
      newEntry,
    ];

    await apiService.syncUserAccess(userId, mergedAccess);

    onSaved?.();
    onClose();
  };

  /* ------------------------------------------------------------
      UI
  ------------------------------------------------------------ */
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[500px] shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Permission</h2>

        <label>User</label>
        <Select
          options={userOptions}
          value={selectedUser}
          onChange={(v) => setSelectedUser(v as Option)}
          placeholder="Select User"
          className="mb-4"
        />

        <label>Group</label>
        <Select
          options={groupOptions}
          value={selectedGroup}
          onChange={(v) => setSelectedGroup(v as Option)}
          placeholder="Select Group"
          className="mb-4"
        />

        <label>Devices</label>
        <Select
          isMulti
          options={deviceOptions}
          value={selectedDevice}
          styles={deviceSelectStyles}
          isDisabled={!selectedGroup}
          placeholder="Select Devices"
          className="mb-4"
          onChange={(selected) => {
            const values = selected as Option[];

            const hasSelectAll = values.some(
              (v) => v.value === SELECT_ALL_VALUE
            );

            if (hasSelectAll) {
              const allDevices = deviceOptions.filter(
                (d) => d.value !== SELECT_ALL_VALUE
              );
              setSelectedDevice(allDevices);
            } else {
              setSelectedDevice(values);
            }
          }}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPermissionModal;
