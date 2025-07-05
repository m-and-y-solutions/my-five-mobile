import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import groupService, { Group } from '../../services/groupService';

export const fetchGroups = createAsyncThunk('groups/fetchGroups', 
  async (_, { getState }) => {
  const state = getState() as any;

  const country = state.auth.user?.country;

  return await groupService.getGroups(country);
});

export const joinGroup = createAsyncThunk('groups/joinGroup', async (groupId: string, { dispatch }) => {
  await groupService.joinGroup(groupId);
  dispatch(fetchGroups());
  return groupId;
});

export const leaveGroup = createAsyncThunk('groups/leaveGroup', async (groupId: string, { dispatch }) => {
  await groupService.leaveGroup(groupId);
  dispatch(fetchGroups());
  return groupId;
});

export const createGroup = createAsyncThunk('groups/createGroup', async (data: { name: string; description: string; rules: string[] }, { dispatch }) => {
  await groupService.createGroup(data);
  dispatch(fetchGroups());
});

export const removeMember = createAsyncThunk('groups/removeMember', async ({ groupId, userId }: { groupId: string; userId: string }, { dispatch }) => {
  await groupService.removeMember(groupId, userId);
  dispatch(fetchGroups());
});

export const deleteGroup = createAsyncThunk('groups/deleteGroup', async (groupId: string, { dispatch }) => {
  await groupService.deleteGroup(groupId);
  dispatch(fetchGroups());
});

export const getGroupJoinRequests = createAsyncThunk(
  'groups/getGroupJoinRequests',
  async (groupId: string) => await groupService.fetchGroupJoinRequests(groupId)
);

export const respondToJoinRequest = createAsyncThunk(
  'groups/respondToJoinRequest',
  async ({ requestId, action }: { requestId: string, action: 'accept' | 'reject' | 'block' }) =>
    await groupService.handleJoinRequest(requestId, action)
);

interface GroupsState {
  groups: Group[];
  loading: boolean;
  error: string | null;
  joinRequests: any[];
  joinRequestsLoading: boolean;
  joinRequestsError: string | null;
}

const initialState: GroupsState = {
  groups: [],
  loading: false,
  error: null,
  joinRequests: [],
  joinRequestsLoading: false,
  joinRequestsError: null,
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action: PayloadAction<Group[]>) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des groupes';
      })
      .addCase(joinGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinGroup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la jonction du groupe';
      })
      .addCase(leaveGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveGroup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du départ du groupe';
      })
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la création du groupe';
      })
      .addCase(removeMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeMember.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la suppression du membre';
      })
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la suppression du groupe';
      })
      .addCase(getGroupJoinRequests.pending, (state) => { state.joinRequestsLoading = true; })
      .addCase(getGroupJoinRequests.fulfilled, (state, action) => {
        state.joinRequestsLoading = false;
        state.joinRequests = action.payload;
      })
      .addCase(getGroupJoinRequests.rejected, (state, action) => {
        state.joinRequestsLoading = false;
        state.joinRequestsError = action.error.message ?? null;
      })
      .addCase(respondToJoinRequest.fulfilled, (state, action) => {
        state.joinRequests = state.joinRequests.filter(r => r.id !== action.meta.arg.requestId);
      });
  },
});

export default groupsSlice.reducer; 