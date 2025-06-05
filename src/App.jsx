
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const EDUCOIN_ADDRESS = '0xaf96Fac1ca3DDBe437bcDE007948B586f021De9D';
const STAKING_ADDRESS = '0x0773253b4FccB3F3f91161319DA8406eE02Ac55D';

const EDU_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) public returns (bool)',
];

const STAKING_ABI = [
  'function stake(uint256 amount) public',
  'function withdraw(uint256 amount) public',
  'function claimReward() public',
  'function stakes(address) view returns (uint256 amount, uint256 rewardDebt, uint256 lastUpdate)',
];

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [stakeInfo, setStakeInfo] = useState(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!window.ethereum) return;
    const prov = new ethers.BrowserProvider(window.ethereum);
    setProvider(prov);
    prov.getSigner().then(setSigner);
    window.ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
      setAccount(accounts[0]);
    });
  }, []);

  useEffect(() => {
    if (!signer || !account) return;
    const edu = new ethers.Contract(EDUCOIN_ADDRESS, EDU_ABI, provider);
    edu.balanceOf(account).then(bal => {
      setBalance(ethers.formatUnits(bal, 18));
    });

    const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, provider);
    staking.stakes(account).then(setStakeInfo);
  }, [signer, account]);

  const stake = async () => {
    const edu = new ethers.Contract(EDUCOIN_ADDRESS, EDU_ABI, signer);
    const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
    const parsedAmount = ethers.parseUnits(amount, 18);
    await edu.approve(STAKING_ADDRESS, parsedAmount);
    await staking.stake(parsedAmount);
  };

  const withdraw = async () => {
    const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
    const parsedAmount = ethers.parseUnits(amount, 18);
    await staking.withdraw(parsedAmount);
  };

  const claimReward = async () => {
    const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
    await staking.claimReward();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">EDUCoin Staking DApp</h1>
        <ConnectButton />
        <p>Connected: {account}</p>
        <p>EDUCoin Balance: {balance}</p>
        <p>Your Stake: {stakeInfo?.amount ? ethers.formatUnits(stakeInfo.amount, 18) : 0}</p>
        <p>Reward Pending: {stakeInfo?.rewardDebt ? ethers.formatUnits(stakeInfo.rewardDebt, 18) : 0}</p>

        <input
          type="number"
          className="w-full p-2 text-black"
          placeholder="Amount to stake or withdraw"
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex gap-4">
          <button onClick={stake} className="bg-blue-600 px-4 py-2 rounded">Stake</button>
          <button onClick={withdraw} className="bg-red-600 px-4 py-2 rounded">Withdraw</button>
          <button onClick={claimReward} className="bg-green-600 px-4 py-2 rounded">Claim Reward</button>
        </div>
      </div>
    </div>
  );
}
