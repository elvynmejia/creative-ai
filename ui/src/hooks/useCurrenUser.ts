import { useEffect } from "react";

import { axiosClient, ANON_USER_ID } from "../utils";

const getIpAddress = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const jsonResponse = await response.json();
    return jsonResponse.ip;
  } catch (error: any) {
    console.error(`Error obtaining IP address. ${error.message}`);
    throw new Error(`Error obtaining IP address. ${error.message}`);
  }
};

const createAnonUser = async () => {
  const ip = await getIpAddress();

  try {
    await axiosClient.post(`/api/v1/users/anon`, {
      ip,
    });

    return { ip };
  } catch (error: any) {
    console.error(`Error creating user with ip ${ip}`);
    throw new Error(`Error creating user with ip ${ip}`);
  }
};

export const UseUser = () => {
  useEffect(() => {
    if (localStorage.getItem(ANON_USER_ID)) {
      console.info(
        "user already exists locally",
        localStorage.getItem(ANON_USER_ID),
      );
      return;
    }

    const setUser = async () => {
      try {
        const { ip } = await createAnonUser();
        localStorage.setItem(ANON_USER_ID, ip);
      } catch (error) {
        alert("Something went wrong. Please refresh the page.");
      }
    };
    setUser();
  }, []);
};
