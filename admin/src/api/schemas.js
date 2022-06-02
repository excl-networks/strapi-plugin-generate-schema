import axiosInstance from '../../src/utils/axiosInstance';

const schemasRequests = {
  getSchemas: async () => {
    console.log("getSchemas");
    const data = await axiosInstance.get(`/generate-schema/schemas`);
    return data;
  },
  mapSchema: async (data) => {
    console.log("mapSchema");
    const response = await axiosInstance.post(`/generate-schema/schemas`, data);
    return response;
  },
  findMappedSchemas: async (collection) => {
    console.log("mapSchema");
    const response = await axiosInstance.get(`/generate-schema/schemas/${collection}`);
    return response;
  },
  deleteSchema: async (collectionId) => {
    console.log("mapSchema");
    const response = await axiosInstance.delete(`/generate-schema/schemas?collectionId=${collectionId}`);
    return response;
  }
};
export default schemasRequests;
