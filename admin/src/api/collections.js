import axiosInstance from '../../src/utils/axiosInstance';

const collectionRequests = {
  getCollections: async () => {
    console.log("getCollections");
    const data = await axiosInstance.get(`/generate-schema/collections`);
    return data;
  },
};
export default collectionRequests;
