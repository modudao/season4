import React, { useState, useEffect } from 'react';
import { prepare, getResult } from 'klip-sdk';
import axios from 'axios';

import smile from '../assets/smile.png';
import './Faucet.css';

const Faucet = () => {
  const [isClaimed, setIsClaimed] = useState(false);
  const [userName, setUserName] = useState(false);

  const handleInputChange = (e) => {
    setUserName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedAddress = localStorage.getItem('klipAddress');
    if (storedAddress && userName != "") {
      const postParams = { "username": userName, "useraddress": storedAddress };
      // console.log("postParams", postParams);

      axios.post('https://ib9fm6yjjg.execute-api.ap-northeast-2.amazonaws.com/ctp/md-user', postParams)
        .then(response => {
          // console.log('Success:', response.data);
        })
        .catch(error => {
          // console.error('There was an error!', error);
        });

      setIsClaimed(true);
    }
  };

  return (
    <div className='faucet-body'>
      {!isClaimed ? (
        <div className='faucet-body-wrapper'>
          <div className='faucet-body-text'>닉네임을 입력하세요</div>
          <div className='faucet-body-text-sub'>모두다오에 오신걸 환영합니다! 닉네임 입력 후 KLAY를 받아가세요!</div>
          <div className='faucet-button-wrapper'>
            <input className='faucet-button-input' type='text' placeholder='1자 이상을 입력하세요' onChange={handleInputChange}>
            </input>
            <button className='faucet-button' onClick={handleSubmit}>
              <div className='faucet-button-text'>확인</div>
            </button>
          </div>
        </div>
      ) : (
        <div className='faucet-body-wrapper'>
          <div className='faucet-body-text-wrapper'>
            <div className='faucet-body-text'>{userName} 님,</div>
            <img className='modu-logo-image' style={{ width: 62, height: 62 }} src={smile} />
          </div>
          <div className='faucet-body-text'>만나서 반갑습니다!</div>
          <div className='faucet-category-wrapper'>
            <div className='faucet-category'>
              <div className='faucet-category-text'>DAPP</div>
            </div>
            <div className='faucet-category'>
              <div className='faucet-category-text'>SBT</div>
            </div>
            <div className='faucet-category'>
              <div className='faucet-category-text'>Governance</div>
            </div>
            <div className='faucet-category'>
              <div className='faucet-category-text'>Contract</div>
            </div>
          </div>
          <div className='faucet-body-text-sub'>맴버십 페이지에서 맴버십을 획득해보세요!</div>
        </div>
      )}
    </div>
  );
};

export default Faucet;
