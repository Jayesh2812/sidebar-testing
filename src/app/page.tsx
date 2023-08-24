// @ts-nocheck
"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import ContentstackAppSDK from "@contentstack/app-sdk";
import JSONEditorDemo from "./JsonEditor";
import { isPlainObject } from "lodash";

export default function Home() {
  const [sideBar, setSideBar] = useState(null);
  const [fieldUids, setFieldUids] = useState([]);
  const [json, _setJson] = useState({});
  const setJson = (json: Object) => {
    _setJson(json)
    console.log(json)
  }
  useEffect(() => {
    if(!window) return
    ContentstackAppSDK.init().then(async function (appSdk) {
      // Get SidebarWidget object
      // this is only initialized on the Entry edit page.
      // on other locations this will return undefined.
      var sidebarWidget = await appSdk.location.SidebarWidget;
      setSideBar(sidebarWidget);
      // fetch app configuration
      var appConfig = await appSdk.getConfig();

      // fetch entry field information
      var fieldData = await sidebarWidget!.entry.getData();
      console.log(fieldData);
      const fields = Object.keys(sidebarWidget.entry.getData());
      const removedUids = [
        "ACL",
        "_version",
        "publish_details",
        "_in_progress",
        "_embedded_items",
        "uid",
        "locale",
        "created_by",
        "updated_by",
        "created_at",
        "updated_at",
        "tags",
      ];
      const uids = fields.filter((field) => !removedUids.includes(field));
      console.log(uids);
      setFieldUids(uids);
      console.log(uids.map((uid) => sidebarWidget.entry.getField(uid)));
    });
  }, []);

  return (
    <div>
      {fieldUids.map((uid) => {
        return (
          <>
            <div>
              {uid}
              <br />
              <input type="text" id={uid} />
              <button
                onClick={() => {
                  let data = sideBar!.entry
                    .getField(uid, { useUnsavedSchema: true })
                    .getData();
                  if (!isPlainObject(data)) {
                    data = { data };
                  }
                  setJson(data);
                }}
              >
                Get
              </button>
              <button
                onClick={() => {
                  const data_type = sideBar.entry.getField(uid).data_type;
                  let data = document.querySelector(`#${uid}`).value;
                  if (data_type === "json") {
                    data = JSON.parse(data);
                  }
                  sideBar.entry.getField(uid).setData(data);
                }}
              >
                Set
              </button>
            </div>
            <hr />
          </>
        );
      })}

      <button
        onClick={(e) => {
          console.log(sideBar.entry._changedData);
          setJson(sideBar.entry._changedData);
        }}
      >
        Get unsaved data
      </button>

      <JSONEditorDemo json={json} onChangeJSON={setJson} />
    </div>
  );
}
