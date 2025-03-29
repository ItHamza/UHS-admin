import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../ui/loader";
import {
  TeamMembersAction,
  UserCreateAction,
  UserUpdateAction,
} from "@/actions/users";
import { noFocusStyle } from "@/utils/styles";
import { UpdateTeamAction } from "@/actions/team";

// Update Team Modal Component
interface UpdateTeamModalProps {
  team: any;
  users: any[]; // List of all available users
  onClose: () => void;
  onUpdate: (updatedTeam: any) => void;
}

const UpdateTeamModal: React.FC<UpdateTeamModalProps> = ({
  team,
  users,
  onClose,
  onUpdate,
}) => {
  const [teamName, setTeamName] = useState(team.name);
  const [description, setDescription] = useState(team.description);
  const [currentMembers, setCurrentMembers] = useState(team.Users);
  const [removedMembers, setRemovedMembers] = useState([]);

  const [showAddMember, setShowAddMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [addedMembers, setAddedMembers] = useState<any[]>([]);
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);

  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const createNewUser = async () => {
    try {
      setLoading(true);
      // Replace with your actual user creation action
      const newUser = await UserCreateAction({
        name: userName,
        phone: phone,
        email: email,
        is_active: true,
        is_blocked: false,
        role: "team_member",
        team_id: team.id,
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMembers = async () => {
    try {
      const userTeamMembers = await TeamMembersAction();
      setAllMembers(userTeamMembers);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const handleRemoveMember = (userId: string) => {
    setCurrentMembers(
      currentMembers.filter((member: any) => member.id !== userId)
    );
    setRemovedMembers(
      currentMembers.filter((member: any) => member.id === userId)
    );
  };

  const handleAddMember = (user: any) => {
    if (!currentMembers.some((member: any) => member.id === user.id)) {
      setCurrentMembers([...currentMembers, user]);
      setAddedMembers([...addedMembers, user]);
    }
    setShowAddMember(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      if (removedMembers.length > 0) {
        await UserUpdateAction(removedMembers, null);
      } else if (addedMembers.length > 0) {
        await UserUpdateAction(addedMembers, team.id);
      } else if (
        isCreatingNewUser &&
        userName.length > 0 &&
        phone.length > 0 &&
        email.length > 0
      ) {
        await createNewUser();
      }
      await UpdateTeamAction({
        name: teamName,
        description,
        id: team.id,
      });
      onUpdate({
        ...team,
        name: teamName,
        description,
        Users: currentMembers,
      });
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allMembers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !currentMembers.some((member: any) => member.id === user.id)
  );

  useEffect(() => {
    fetchAllMembers();
  }, []);
  return (
    <div className='fixed inset-0 bg-gray-800/40 bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full   max-h-[500px] overflow-scroll max-w-full'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Update Team</h2>

          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label
                htmlFor='teamName'
                className='block text-sm font-medium text-gray-700 mb-1'>
                Team Name
              </label>
              <input
                id='teamName'
                type='text'
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                required
              />
            </div>

            <div className='mb-4'>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-700 mb-1'>
                Description
              </label>
              <textarea
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              />
            </div>

            <div className='mb-4'>
              <div className='flex justify-between items-center mb-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Team Members
                </label>
                <div className='flex items-center gap-2'>
                  {!isCreatingNewUser && showAddMember && (
                    <button
                      type='button'
                      onClick={() => setIsCreatingNewUser(!isCreatingNewUser)}
                      className='text-sm text-indigo-600 hover:text-indigo-500'>
                      {"+ Create New"}
                    </button>
                  )}
                  <button
                    type='button'
                    onClick={() => {
                      setIsCreatingNewUser(false);
                      setShowAddMember(!showAddMember);
                    }}
                    className='text-sm text-red-600 hover:text-red-500'>
                    {showAddMember ? "Cancel" : "+ Add Member"}
                  </button>
                </div>
              </div>

              {showAddMember && (
                <div className='mb-4'>
                  <input
                    type='text'
                    placeholder='Search users...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mb-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                  />
                  <div className='max-h-40 overflow-y-auto border rounded-md'>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className='p-2 hover:bg-gray-50 cursor-pointer flex items-center'
                          onClick={() => handleAddMember(user)}>
                          <div className='bg-gray-200 rounded-full h-6 w-6 flex items-center justify-center mr-2'>
                            <span className='text-gray-600 text-xs'>
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <span>{user.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className='p-2 text-gray-500 text-sm'>
                        No users found
                      </div>
                    )}
                  </div>
                </div>
              )}
              {isCreatingNewUser && (
                <>
                  <div className='space-y-3'>
                    <label className='block font-medium text-gray-700'>
                      Full Name
                    </label>
                    <input
                      type='text'
                      name='userName'
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                      }}
                      className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                      placeholder='John Doe'
                      required
                    />
                  </div>

                  <div className='mt-2'>
                    <label className='  flex items-center gap-2  font-medium text-gray-700'>
                      Phone Number{" "}
                      <span className='text-xs'>(with country code +971)</span>
                    </label>
                    <input
                      type='tel'
                      name='phoneNumber'
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                      }}
                      className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                      placeholder='+971501234567'
                      required
                    />
                  </div>

                  <div className='mt-2'>
                    <label className='block font-medium text-gray-700'>
                      Email
                    </label>
                    <input
                      type='email'
                      name='email'
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                      placeholder='john@example.com'
                      required
                    />
                  </div>
                </>
              )}
              {!showAddMember && (
                <div className='space-y-2'>
                  {currentMembers.map((member: any) => (
                    <div
                      key={member.id}
                      className='flex items-center justify-between p-2 bg-gray-50 rounded-md'>
                      <div className='flex items-center'>
                        <div className='bg-gray-200 rounded-full h-6 w-6 flex items-center justify-center mr-2'>
                          <span className='text-gray-600 text-xs'>
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <span>{member.name}</span>
                      </div>
                      <button
                        type='button'
                        onClick={() => handleRemoveMember(member.id)}
                        className='text-red-500 hover:text-red-700'>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='mt-6 flex justify-end space-x-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none'>
                Cancel
              </button>
              {!loading ? (
                <button
                  type='submit'
                  className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none'>
                  Save Changes
                </button>
              ) : (
                <Loader />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateTeamModal;
