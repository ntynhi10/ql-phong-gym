const users = [
    { id:1,
      username: "admin",
      password: "123",
      role: "admin"
    },
    { id:2,
      username: "staff",
      password: "123",
      role: "staff" 
    }
];

const findUser = (username, password) => {
    return users.find(
        u => u.username === username && u.password === password
    );
};

const findById = (id) => {
  return users.find(u => u.id === Number(id));
};

module.exports = { findUser, findById };
