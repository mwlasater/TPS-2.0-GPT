import type {
  ManagedUserDetail,
  PropertyCode,
  UserAdminActionList
} from "@tps/types";
import { useEffect, useState } from "react";

import { fetchManagedUserDetail, fetchUserAdminActions } from "../lib/api.js";
import { demoUserAdminActions, demoUserDetails } from "../lib/session.js";

interface UserAdminDataState {
  detail: ManagedUserDetail;
  actions: UserAdminActionList;
  source: "api" | "fallback";
  isLoading: boolean;
}

export function useUserAdminData(
  propertyCode: PropertyCode,
  userId: string
): UserAdminDataState {
  const [state, setState] = useState<UserAdminDataState>({
    detail: demoUserDetails[propertyCode],
    actions: demoUserAdminActions,
    source: "fallback",
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      detail: demoUserDetails[propertyCode],
      actions: demoUserAdminActions,
      source: "fallback",
      isLoading: true
    });

    void Promise.all([
      fetchManagedUserDetail(propertyCode, userId),
      fetchUserAdminActions(propertyCode, userId)
    ])
      .then(([detail, actions]) => {
        if (isMounted) {
          setState({
            detail,
            actions,
            source: "api",
            isLoading: false
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            detail: demoUserDetails[propertyCode],
            actions: demoUserAdminActions,
            source: "fallback",
            isLoading: false
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode, userId]);

  return state;
}
