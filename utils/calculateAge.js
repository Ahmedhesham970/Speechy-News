const express = require("express");
const app = express();
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();

  return age;
};
module.exports = calculateAge;
