'use client';
import { Menu } from '@arco-design/web-react';

// import Image from 'next/image';

const MenuItem = Menu.Item;

export default function NavBar() {
  return (
    <Menu defaultSelectedKeys={['1']} mode="horizontal">
      <MenuItem disabled key="0" style={{ padding: 0, marginRight: 38 }}>
        {/* <Image /> */}
      </MenuItem>
      <MenuItem key="1">Home</MenuItem>
      <MenuItem key="2">Solution</MenuItem>
      <MenuItem key="3">Cloud Service</MenuItem>
      <MenuItem key="4">Cooperation</MenuItem>
    </Menu>
  );
}
