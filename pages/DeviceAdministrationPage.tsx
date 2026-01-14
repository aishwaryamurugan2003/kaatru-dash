import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { apiService } from "../services/api";
import { Endpoint } from "../services/api";
import AddPermissionModal from "../components/AddPermissionModal";
import { Tooltip } from "antd";
import EditPermissionModal from "../components/EditPermissionModal";

const DeviceAdministrationPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  const [searchText, setSearchText] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await apiService.get(Endpoint.ACCESS_MANAGEMENT);
      const data = res?.data;

      if (Array.isArray(data)) {
        const normalized = data.map((u, index) => ({
          key: u.user_id,
          sno: index + 1,
          username: u.username,
          email: u.email,
          groups: u.access?.map((g) => g.group_name).join(", "),
          access: u.access,
        }));

        setUsers(normalized);
      }
    } catch (error) {
      console.log("ACCESS MGMT ERROR:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { title: "S.No", dataIndex: "sno", width: 80 },
    { title: "Username", dataIndex: "username" },
    {title: "Groups", dataIndex: "groups", key: "groups", render: (_, record) => <GroupChips access={record.access} />,},
    { title: "Email Address", dataIndex: "email" },
    {
      title: "Actions",
      width: 120,
      render: (_, record) => (
        <div className="flex gap-4 text-lg cursor-pointer">
          <EditOutlined
            className="text-blue-600 hover:text-blue-800"
            onClick={() => setEditUser(record)}
          />
          <DeleteOutlined className="text-red-600 hover:text-red-800" />
        </div>
      ),
    },
  ];


const GroupChips = ({ access }) => {
  if (!access || access.length === 0) return "—";

  const firstThree = access.slice(0, 3);
  const remaining = access.slice(3);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {firstThree.map((g) => (
        <span
          key={g.group_id}
          className="px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700"
        >
          {g.group_name}
        </span>
      ))}

      {remaining.length > 0 && (
        <Tooltip
          title={
            <div className="flex flex-col gap-1">
              {remaining.map((g) => (
                <span key={g.group_id}>{g.group_name}</span>
              ))}
            </div>
          }
        >
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-700 cursor-pointer">
            +{remaining.length}
          </span>
        </Tooltip>
      )}
    </div>
  );
};


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Device Management</h1>

      <div className="flex justify-between mb-6">
        <input
          placeholder="Search..."
          className="border px-4 py-2 rounded-lg w-1/3"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Add Permission
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <Table
          columns={columns}
          dataSource={users.filter((u) =>
            [u.username, u.email, u.groups]
              .join(" ")
              .toLowerCase()
              .includes(searchText.toLowerCase())
          )}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* ADD */}
      <AddPermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* EDIT */}
      <EditPermissionModal
        isOpen={!!editUser}
        user={editUser}
        onClose={() => setEditUser(null)}
        onUpdated={fetchUsers}
      />
    </div>
  );
};

export default DeviceAdministrationPage;
