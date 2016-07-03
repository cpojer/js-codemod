async function a() {
  const c = await b();
  return c.d;
}

async function embedded() {
  await first();
  await second();
  return third();
}

async function promiseArrowShorthand() {
  const result = await asyncFunc();
  return { result };
}

const functionExpression = async function() {
  const result = await asyncFunc();
  return result * 2;
};

async function countUserVotes(userIds) {
  const users = await getUsers(userIds);
  return Promise.reduce(users, async (acc, user) => {
    const count = await user.getVoteCount();
    return acc + count;
  });
}
