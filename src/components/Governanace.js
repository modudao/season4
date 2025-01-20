import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { prepare, request, getResult } from 'klip-sdk';
import { ethers } from 'ethers';
import QRCode from 'qrcode.react';
import Modal from 'react-modal';

import './Governanace.css';

function Governanace() {
  const [selectedImage, setSelectedImage] = useState('사진1');
  const [isSelectedGovernance1, setIsSelectedGovernance1] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [hasVotedGovernance1, setHasVotedGovernance1] = useState(false);
  const [hasVotedGovernance2, setHasVotedGovernance2] = useState(false);
  const [voteData, setVoteData] = useState("");
  const [voteRate, setVoteRate] = useState(0);
  const [winImage, setWinImage] = useState([]);
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [proposerNickname, setProposerNickname] = useState("");
  const [winnerNickname, setWinnerNickname] = useState("");
  const [joinRate, setJoinRate] = useState(0);
  const [proposerAmount, setProposerAmount] = useState(0);
  const [winnerAmount, setWinnerAmount] = useState(0);

  const nftAddress = "0xdaa59a82A6191F3AE28a7E95513163Aa22098A97";
  const voteAbi = '{"inputs": [{"internalType": "uint256","name": "option","type": "uint256"}],"name": "vote","outputs": [],"stateMutability": "nonpayable","type": "function"}';
  const joinAbi = '{"inputs": [],"name": "join","outputs": [],"stateMutability": "nonpayable","type": "function"}';
  const nftAbi = [{
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasJoined",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "hasVotedGovernance1",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hasVotedGovernance2",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "getVotes",
    "outputs": [
      {
        "internalType": "uint256[4]",
        "name": "",
        "type": "uint256[10]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "tokenCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "getProposerNickname",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "getWinnerNickname",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "participantCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "proposerAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "winnerAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }];

  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider("https://public-en.node.kaia.io");
    const nftContract = new ethers.Contract(nftAddress, nftAbi, provider);

    setSelectedImage(selectedImage);

    const checkVotedStatus = async () => {
      try {
        const userAdderss = localStorage.getItem('klipAddress');
        setTreasuryBalance((await provider.getBalance(nftAddress)).toString() / 10 ** 18);

        if (userAdderss == '') {
          setHasVotedGovernance1(false);
        } else {
          setHasVoted(await nftContract.hasVoted(userAdderss));
          const govStatus = await nftContract.hasVotedGovernance1();
          if (govStatus) {
            setHasVotedGovernance1(true);
            const data = (await nftContract.getVotes()).map(Number);
            const maxIndex = data.indexOf(Math.max(...data));

            const totalCount = Number(await nftContract.tokenCounter());
            const sum = data.reduce((acc, curr) => acc + curr, 0);

            setProposerNickname(await nftContract.getProposerNickname());
            setProposerAmount((await nftContract.proposerAmount()).toString() / 10 ** 18);
            setVoteRate(Math.round(sum / totalCount * 100));
            setWinImage(`사진${maxIndex + 1}`);
            setVoteData(data);
          } else {
            setHasVotedGovernance1(false);
          }

          setHasJoined(await nftContract.hasJoined(userAdderss));
          const govStatus2 = await nftContract.hasVotedGovernance2();
          if (govStatus2) {
            setHasVotedGovernance2(true);

            setWinnerNickname(await nftContract.getWinnerNickname());
            const totalCount = Number(await nftContract.tokenCounter());
            const sum = Number(await nftContract.participantCount());
            setJoinRate(Math.round(sum / totalCount * 100));
            setWinnerAmount((await nftContract.winnerAmount()).toString() / 10 ** 18);
          } else {
            setHasVotedGovernance2(false);
          }
        }
      } catch (error) {
        // console.error('Error checking membership status:', error);
      }
    };

    checkVotedStatus();
    // 10초마다 갱신
    const intervalId = setInterval(checkVotedStatus, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedImage(value);
  };

  const handleGovernance1Click = () => {
    setIsSelectedGovernance1(true);
  };

  const handleGovernance2Click = () => {
    setIsSelectedGovernance1(false);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const data = {
    labels: ['사진1', '사진2', '사진3', '사진4', '사진5', '사진6', '사진7', '사진8', '사진9', '사진10'],
    datasets: [
      {
        data: voteData,
        backgroundColor: ['blue', 'yellow', 'green', 'orange', 'red', 'cyan', 'magenta', 'brown', 'purple', 'black'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false, position: 'top', },
      title: { display: true, text: '거버넌스1 투표 결과', },
    },
    maintainAspectRatio: false,
  };

  const voteImage = async () => {
    const bappName = 'MODULAB DAPP';

    let params;
    if (selectedImage == '사진1') {
      params = '[0]';
    } else if (selectedImage == '사진2') {
      params = '[1]';
    } else if (selectedImage == '사진3') {
      params = '[2]';
    } else if (selectedImage == '사진4') {
      params = '[3]';
    } else if (selectedImage == '사진5') {
      params = '[4]';
    } else if (selectedImage == '사진6') {
      params = '[5]';
    } else if (selectedImage == '사진7') {
      params = '[6]';
    } else if (selectedImage == '사진8') {
      params = '[7]';
    } else if (selectedImage == '사진9') {
      params = '[8]';
    } else if (selectedImage == '사진10') {
      params = '[9]';
    }

    // Step 1: Prepare the contract action
    const transaction = {
      bappName,
      to: nftAddress,
      abi: voteAbi,
      value: '0',
      params,
      from: localStorage.getItem('klipAddress'),
    };

    if (!hasVoted) {
      // Step 2: Request the contract action through Klip
      const { request_key } = await prepare.executeContract(transaction);
      // const res = await axios.post(A2P_API_PREPARE_URL, {
      //   bapp: { name: bappName, },
      //   transaction,
      //   type: "execute_contract",
      // })
      // const { request_key } = res.data;

      const userAgent = navigator.userAgent;
      if (/Windows/i.test(userAgent) || /Macintosh/i.test(userAgent)) {
        const qrURL = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
        // window.open(qrURL, '_blank');
        setQrValue(qrURL);

        openModal();
      } else {
        request(request_key);
      }

      // Step 3: Poll for the result
      // const interval = setInterval(() => {
      //   getResult(request_key, (result) => {
      //     if (result.err) {
      //       console.error(result.err);
      //       clearInterval(interval);
      //       return;
      //     }
      //     if (result.result) {
      //       clearInterval(interval);
      //     }
      //   });
      // }, 1000);
    }
  };

  const join = async () => {
    const bappName = 'MODULAB DAPP';

    // Step 1: Prepare the contract action
    const transaction = {
      bappName,
      to: nftAddress,
      abi: joinAbi,
      value: '0',
      params: '[]',
      from: localStorage.getItem('klipAddress'),
    };

    if (!hasJoined) {
      // Step 2: Request the contract action through Klip
      const { request_key } = await prepare.executeContract(transaction);
      // const res = await axios.post(A2P_API_PREPARE_URL, {
      //   bapp: { name: bappName, },
      //   transaction,
      //   type: "execute_contract",
      // })
      // const { request_key } = res.data;

      const userAgent = navigator.userAgent;
      if (/Windows/i.test(userAgent) || /Macintosh/i.test(userAgent)) {
        const qrURL = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
        // window.open(qrURL, '_blank');
        setQrValue(qrURL);

        openModal();
      } else {
        request(request_key);
      }

      // Step 3: Poll for the result
      // const interval = setInterval(() => {
      //   getResult(request_key, (result) => {
      //     if (result.err) {
      //       console.error(result.err);
      //       clearInterval(interval);
      //       return;
      //     }
      //     if (result.result) {
      //       clearInterval(interval);
      //     }
      //   });
      // }, 1000);
    }
  };

  return (
    <div className='gov-body'>
      <div className='gov-wrapper'>
        <div className='gov-title'>거버넌스를 참여하세요</div>
        {isSelectedGovernance1 ? (
          <div>
            <div className='gov-select-wrapper'>
              <button className='gov-select-button1' onClick={handleGovernance1Click}>
                <div className='gov-select-text'>거버넌스1</div>
              </button>
              <button className='gov-select-button2' onClick={handleGovernance2Click}>
                <div className='gov-select-text2'>거버넌스2</div>
              </button>
            </div>
            {!hasVotedGovernance1 ? (
              <div className='voted-wrapper'>
                <div className='gov-title-sub'>맴버십 사진을 선택해주세요</div>
                <div className='gov-title-sub2'>투표가 모두 완료되는 순간 클립 지갑에 있는 맴버십 사진이 변경됩니다!</div>
                <div className='gov-image-wrapper'>
                  <div className='gov-image-wrapper-sub'>
                    <img className='gov-image' style={{ width: 143, height: 143 }} src={"https://raw.githubusercontent.com/modudao/images/main/season4/daolabnft1.png"} />
                    <div className='gov-image-text'>사진1</div>
                  </div>
                  <div className='gov-image-wrapper-sub'>
                    <img className='gov-image' style={{ width: 143, height: 143 }} src={"https://raw.githubusercontent.com/modudao/images/main/season4/daolabnft2.png"} />
                    <div className='gov-image-text'>사진2</div>
                  </div>
                </div>
                <div className='gov-image-wrapper'>
                  <div className='gov-image-wrapper-sub'>
                    <img className='gov-image' style={{ width: 143, height: 143 }} src={"https://raw.githubusercontent.com/modudao/images/main/season4/daolabnft3.png"} />
                    <div className='gov-image-text'>사진3</div>
                  </div>
                  <div className='gov-image-wrapper-sub'>
                    <img className='gov-image' style={{ width: 143, height: 143 }} src={"https://raw.githubusercontent.com/modudao/images/main/season4/daolabnft4.png"} />
                    <div className='gov-image-text'>사진4</div>
                  </div>
                </div>
                <div className='gov-image-wrapper'>
                  <div className='gov-image-wrapper-sub'>
                    <img className='gov-image' style={{ width: 143, height: 143 }} src={"https://raw.githubusercontent.com/modudao/images/main/season4/daolabnft5.png"} />
                    <div className='gov-image-text'>사진5</div>
                  </div>
                  <div className='gov-image-wrapper-sub'>
                    <img className='gov-image' style={{ width: 143, height: 143 }} src={"https://raw.githubusercontent.com/modudao/images/main/season4/daolabnft6.png"} />
                    <div className='gov-image-text'>사진6</div>
                  </div>
                </div>
                <div className='gov-image-wrapper'>
                  <div className='gov-image-wrapper-sub'>
                    <img className='gov-image' style={{ width: 143, height: 143 }} src={"https://raw.githubusercontent.com/modudao/images/main/season4/daolabnft7.png"} />
                    <div className='gov-image-text'>사진7</div>
                  </div>
                  <div className='gov-image-wrapper-sub'>
                    <img className='gov-image' style={{ width: 143, height: 143 }} src={"https://raw.githubusercontent.com/modudao/images/main/season4/daolabnft8.png"} />
                    <div className='gov-image-text'>사진8</div>
                  </div>
                </div>
                <div className='gov-image-wrapper'>
                  <div className='gov-image-wrapper-sub'>
                    <img className='gov-image' style={{ width: 143, height: 143 }} src={"https://raw.githubusercontent.com/modudao/images/main/season4/daolabnft9.png"} />
                    <div className='gov-image-text'>사진9</div>
                  </div>
                  <div className='gov-image-wrapper-sub'>
                    <img className='gov-image' style={{ width: 143, height: 143 }} src={"https://raw.githubusercontent.com/modudao/images/main/season4/daolabnft10.png"} />
                    <div className='gov-image-text'>사진10</div>
                  </div>
                </div>
                <div className='gov-image-select-wrapper'>
                  <select className='gov-image-select' value={selectedImage} onChange={handleChange}>
                    <option value='사진1'>사진1</option>
                    <option value='사진2'>사진2</option>
                    <option value='사진3'>사진3</option>
                    <option value='사진4'>사진4</option>
                    <option value='사진5'>사진5</option>
                    <option value='사진6'>사진6</option>
                    <option value='사진7'>사진7</option>
                    <option value='사진8'>사진8</option>
                    <option value='사진9'>사진9</option>
                    <option value='사진10'>사진10</option>
                  </select>
                  <button className={hasVoted ? 'gov-image-select-button-inactive' : 'gov-image-select-button'} onClick={voteImage}>
                    <div className='gov-image-select-text'>{hasVoted ? "투표 완료" : "투표"}</div>
                  </button>
                  <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    className="modal-content"
                    overlayClassName="modal-overlay"
                    contentLabel="QR Code Modal"
                  >
                    <div className='membership-body-text'>QR 코드를 스캔하세요</div>
                    <QRCode value={qrValue} size={256} />
                  </Modal>
                </div>
              </div>
            ) : (
              <div className='voted-wrapper'>
                <div className='gov-title-sub'>투표가 완료되었습니다. {winImage} 로 결정되었습니다.</div>
                <div className='gov-title-sub2'>제안자 {proposerNickname} 님께 {proposerAmount} KLAY 가 정상적으로 전송되었습니다. 클립 지갑에서 다오랩 맴버십 NFT 사진이 변경되었는지 확인해보세요!</div>
                <div className='gov-title-sub3'>*투표율: {voteRate}%</div>
                <div style={{ width: '293px', height: '293px' }}>
                  <Bar data={data} options={options} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className='gov-select-wrapper'>
              <button className='gov-select-button2' onClick={handleGovernance1Click}>
                <div className='gov-select-text'>거버넌스1</div>
              </button>
              <button className='gov-select-button1' onClick={handleGovernance2Click}>
                <div className='gov-select-text2'>거버넌스2</div>
              </button>
            </div>
            {!hasVotedGovernance2 ? (
              <div className='voted-wrapper'>
                <div className='gov-title-sub'>트레져리 물량을 분배해드립니다</div>
                <div className='gov-title-sub2'>참여 안하신분들은 맴버쉽 구매에 사용하셨던 KLAY 그대로 돌려드립니다! <br /> <span style={{ fontWeight: 'bold' }}>참여한 사람 기준으로 컨트렉트 내에서 랜덤한 한명을 선택</span> 후 남은 KLAY 를 전송해드립니다! 랜덤한 사람을 추출하는 방식은 코드에 반영되어있어, 매우 투명하게 진행될꺼에요! </div>
                <div className='gov-title-sub3'>*트레져리 물량: {treasuryBalance} KLAY</div>
                <button className={hasJoined ? 'gov-apply-button-inactive' : 'gov-apply-button'} onClick={join}>
                  <div className='gov-image-select-text'>{hasJoined ? "참여 완료" : "참여"}</div>
                </button>
                <Modal
                  isOpen={modalIsOpen}
                  onRequestClose={closeModal}
                  className="modal-content"
                  overlayClassName="modal-overlay"
                  contentLabel="QR Code Modal"
                >
                  <div className='membership-body-text'>QR 코드를 스캔하세요</div>
                  <QRCode value={qrValue} size={256} />
                </Modal>
              </div>
            ) : (
              <div className='voted-wrapper'>
                <div className='gov-title-sub'>{winnerNickname} 님, 우승 축하드립니다</div>
                <div className='gov-title-sub2'>다들 고생많으셨습니다! 우승자 {winnerNickname} 님께 {winnerAmount} KLAY 전송 완료되었습니다. 다시 한 번 진심으로 축하드립니다!</div>
                <div className='gov-title-sub3'>*참여율: {joinRate}%</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Governanace;
