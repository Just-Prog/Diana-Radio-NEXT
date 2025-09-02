import { createClient } from 'redis';

const redis = await createClient({
  url: `${process.env.REDIS_URL}/${process.env.NODE_ENV === 'production' ? '0' : '1'}`,
}).connect();

export default redis;
