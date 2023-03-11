interface User {
  user: string;
  age: number;
  male: boolean;
  role: {
    name: string;
    expire: boolean;
  };
  $schema: string;
}
interface Test {
  name: string;
  age: number;
  userInfo: {
    id: string;
    uId: number;
    roles: Array<{
      name: string
    }>;
  };
}