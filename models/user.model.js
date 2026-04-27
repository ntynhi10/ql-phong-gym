const prisma = require("./prisma");

const findUser = async (username, password) => {
  return await prisma.user.findFirst({
    where: { username, password },
  });
};

const findById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
  });
};

module.exports = { findUser, findById };
