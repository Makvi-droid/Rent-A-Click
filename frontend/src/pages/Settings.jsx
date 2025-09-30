import React from "react";
import DevSection from "../DevSection";
import Navbar from "../components/Navbar";

function Settings() {
  return (
    <div>
      <Navbar />
      <DevSection sectionName="Account settings" />
    </div>
  );
}

export default Settings;
