"use client";

import React from "react";

export default function Page() {
  return (
    <main className="h-full w-full bg-white text-black overflow-hidden px-4 pt-20">
      <section className="mx-auto max-w-4xl">
        <style>{`
@import url('https://fonts.googleapis.com/css?family=Acme&display=swap');
@keyframes changeOrder {
  from { z-index: 9;}
  to { z-index: 1; }
}
@keyframes handShake {
  0%,100% { transform: rotate(10deg); }
  50% { transform: rotate(-10deg); }
}
@keyframes handShake2 {
  0%,100% { transform: rotateY(180deg) rotate(10deg); }
  50% { transform: rotateY(180deg) rotate(-10deg); }
}
html, body {
  margin: 0;
  padding: 0;
  border: 0;
  line-height: 1;
  font-family: Acme, Arial, sans-serif;
}
.rps-form {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
h1 {
  text-align: center;
}
#hands {
  text-align: center;
}
.rps-form input:checked ~ div .hand {
  animation: none !important;
}
.hand {
  margin: 20px;
  width: 200px;
  height: 200px;
  position: relative;
  transform: rotate(10deg);
  display: inline-block;
  animation: handShake 2s infinite;
}
.hand > div {
  position: absolute;
  box-sizing: border-box;
  border: 2px solid black;
  background: gold;
  transition: all 0.1s;
}
.fist {
  height: 110px;
  left: 40px;
  top: 50px;
  width: 90px;
  border-radius: 20px 0 0 20px;
}
.finger {
  width: 70px;
  height: 30px;
  border-radius: 20px;
  left: 80px;
  transform-origin: 0 50%;
}
.finger-1 { top: 50px; --dif: 0px; }
.finger-2 { top: 78px; left: 84px; --dif: 4px; }
.finger-3 { top: 106px; --dif: 0px; }
.finger-4 { top: 134px; height: 26px; left: 76px; --dif: -8px; }
div.thumb {
  width: 35px;
  height: 70px;
  border-radius: 0 20px 20px 20px;
  top: 50px;
  left: 80px;
  border-left: 0 solid;
  box-shadow: -17px 6px 0 -15px black;
}
div.arm {
  width: 22px;
  height: 70px;
  left: 20px;
  top: 70px;
  border: 0;
  border-top: 2px solid black;
  border-bottom: 2px solid black;
}
#user-hand {
  transform: rotateY(180deg);
  animation: handShake2 2s infinite;
  position: relative;
}
.rps-form input[type="radio"] {
  position: absolute;
  top: -1000in;
  left: -1000in;
}
.rps-form input[id$="scissors"]:checked ~ div #user-hand .finger-1,
.rps-form input[id^="scissors"]:checked ~ div #computer-hand .finger-1 {
  width: 130px;
  transform:rotate(-5deg);
}
.rps-form input[id$="scissors"]:checked ~ div #user-hand .finger-2,
.rps-form input[id^="scissors"]:checked ~ div #computer-hand .finger-2 {
  width: 130px;
  transform:rotate(5deg);
}
.rps-form input[id$="paper"]:checked ~ div #user-hand .finger-1,
.rps-form input[id$="paper"]:checked ~ div #user-hand .finger-2,
.rps-form input[id$="paper"]:checked ~ div #user-hand .finger-3,
.rps-form input[id$="paper"]:checked ~ div #user-hand .finger-4,
.rps-form input[id^="paper"]:checked ~ div #computer-hand .finger-1,
.rps-form input[id^="paper"]:checked ~ div #computer-hand .finger-2,
.rps-form input[id^="paper"]:checked ~ div #computer-hand .finger-3,
.rps-form input[id^="paper"]:checked ~ div #computer-hand .finger-4 {
  left: 124px;
  left: calc(124px + var(--dif));
  width: 80px;
  border-left: 0;
  border-radius: 0 20px 20px 0;
}
#rock-rock:checked ~ div h2::before,
#paper-paper:checked ~ div h2::before,
#scissors-scissors:checked ~ div h2::before {
  content: "You Tied!";
}
#rock-paper:checked ~ div h2::before,
#paper-scissors:checked ~ div h2::before,
#scissors-rock:checked ~ div h2::before {
  content: "You Win!";
}
#rock-scissors:checked ~ div h2::before,
#paper-rock:checked ~ div h2::before,
#scissors-paper:checked ~ div h2::before {
  content: "Computer Wins!";
}
#message {
  text-align: center;
  display: none;
}
.rps-form input:checked ~ #message {
  display: block;
}
#hands {
  display: flex;
  align-items: center;
  justify-content: center;
}
#icons {
  width: 30px;
  height: 200px;
  display: inline-flex;
  flex-direction: column;
}
#icons > div {
  flex: 1;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  overflow: hidden;
  position: relative;
}
label:active {
  position:static; 
  margin-left: 60px;
}
label:active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 60px;
  z-index: 10;
  height: 60px;
}
label {
  animation: changeOrder 0.45s infinite linear;
  background: #f5f5f5;
  border: 1px solid #ccc;
  box-sizing: border-box;
  cursor: pointer;
  display: block;
  height: 60px;
  width: 60px;
  line-height: 60px;
  font-size: 2rem;
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
}
label:nth-of-type(1) { animation-delay: -0.00s; }
label:nth-of-type(2) { animation-delay: -0.15s; }
label:nth-of-type(3) { animation-delay: -0.30s; }
        `}</style>

        <form className="rps-form">
          <input type="radio" id="rock-rock" name="rock-paper-scissors" />
          <input type="radio" id="rock-paper" name="rock-paper-scissors" />
          <input type="radio" id="rock-scissors" name="rock-paper-scissors" />
          <input type="radio" id="paper-rock" name="rock-paper-scissors" />
          <input type="radio" id="paper-paper" name="rock-paper-scissors" />
          <input type="radio" id="paper-scissors" name="rock-paper-scissors" />
          <input type="radio" id="scissors-rock" name="rock-paper-scissors" />
          <input type="radio" id="scissors-paper" name="rock-paper-scissors" />
          <input type="radio" id="scissors-scissors" name="rock-paper-scissors" />

          <div>
            <h1>CSS Rock-Paper-Scissors</h1>
            <div id="hands">
              <div className="hand" id="computer-hand">
                <div className="fist"></div>
                <div className="finger finger-1"></div>
                <div className="finger finger-2"></div>
                <div className="finger finger-3"></div>
                <div className="finger finger-4"></div>
                <div className="thumb"></div>
                <div className="arm"></div>
              </div>

              <div className="hand" id="user-hand">
                <div className="fist"></div>
                <div className="finger finger-1"></div>
                <div className="finger finger-2"></div>
                <div className="finger finger-3"></div>
                <div className="finger finger-4"></div>
                <div className="thumb"></div>
                <div className="arm"></div>
              </div>

              <div id="icons">
                <div>
                  <label htmlFor="rock-rock">✊</label>
                  <label htmlFor="paper-rock">✊</label>
                  <label htmlFor="scissors-rock">✊</label>
                </div>
                <div>
                  <label htmlFor="rock-paper">🖐️</label>
                  <label htmlFor="paper-paper">🖐️</label>
                  <label htmlFor="scissors-paper">🖐️</label>
                </div>
                <div>
                  <label htmlFor="rock-scissors">✌</label>
                  <label htmlFor="paper-scissors">✌</label>
                  <label htmlFor="scissors-scissors">✌</label>
                </div>
              </div>
            </div>
          </div>

          <div id="message">
            <h2></h2>
            <input
              type="reset"
              value="Refresh Round (Click to restart)"
              className="mt-4 cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-400 active:translate-y-[1px] active:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </section>
    </main>
  );
}