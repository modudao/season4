import React, { useState, useEffect } from 'react';
import axios from 'axios';

import storage from '../config/localstorage.json';

import './Chatbot.css';

const Chatbot = () => {
  const [inputValue, setInputValue] = useState(''); // 입력값
  const [apiResponse, setApiResponse] = useState(''); // API 응답값
  const [loading, setLoading] = useState(false); // 로딩 상태

  // 비밀링크
  const [isFind, setIsFind] = useState(false); // 로딩 상태

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event) => {
    const storedAddress = localStorage.getItem(storage.klip);
    if (storedAddress && inputValue != "" && !loading) {
      event.preventDefault();
      setLoading(true);
      setApiResponse("");

      // 비밀링크
      setIsFind(false);

      try {
        const response = await axios.post('https://ib9fm6yjjg.execute-api.ap-northeast-2.amazonaws.com/ctp/md-gpt', { useraddress: storedAddress, prompt: inputValue });
        const data = await response.data;

        setApiResponse(data.message);

        // 비밀링크
        if (data.message.includes("present")) {
          setIsFind(true);
        }

      } catch (error) {
        setApiResponse('API 호출 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='chatbot-body'>
      {true ? (
        <div className='chatbot-body-wrapper'>
          <div className='chatbot-title-wrapper'>
            <div className='chatbot-title-text'>
              챗봇과 대화하세요
            </div>
            <div className='chatbot-sub-text'>
              모두다오 디앱에 대해서 궁금한 점이 있나요? 언제든지 물어보세요!
            </div>
            <div className='chatbot-sub-text2'>
              여러분의 질문에 빠르고 정확하게 답변할 준비가 되어 있습니다. 필요한 정보를 얻고 싶다면 지금 바로 대화를 시작해보세요!
            </div>
          </div>
          <div className='chatbot-question-wrapper'>
            <div className='chatbot-question-text'>질문</div>
            <div className='chatbot-question-input-wrapper'>
              <input
                className='chatbot-question-input'
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="궁금한 내용을 입력해주세요"
              />
              <div className='chatbot-question-btn' onClick={handleSubmit}>
                <div className='chatbot-question-btn-text'>{loading ? '...' : '입력'}</div>
              </div>
            </div>
          </div>
          <div className='chatbot-answer-wrapper'>
            <div className='chatbot-answer-text'>답변</div>
            <div className='chatbot-answer-box'>
              {!isFind ? (
                <div className='chatbot-answer-text'>{apiResponse}</div>
              ) : (
                <a href="https://modudao.github.io/season4/#/present" className='chatbot-answer-text'>이벤트 참여하러가기</a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='chatbot-body-wrapper'>
          <div className='chatbot-title-wrapper'>
            <div className='chatbot-title-text'>
              챗봇과 대화하세요
            </div>
            <div className='chatbot-sub-text'>
              맴버십을 먼저 구매해주세요!
            </div>
            <div className='chatbot-sub-text2'>
              맴버십 페이지에서 다오랩 멤버십을 구매한 후에 이용할 수 있습니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
