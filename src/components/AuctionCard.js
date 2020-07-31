/* eslint-disable no-unused-vars,react/prop-types,react/no-deprecated */
import React from 'react';
import { Row, Col, Card, InputNumber, message, Divider, Statistic } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import '../css/auctioncard.css';
import { history } from '../utils/history';
import { getAuctionByAuctionId, updateAuction } from '../services/goodsService';

const { Countdown } = Statistic;


let auctionData = null;
let tmpId;
let startTrigger = null;
let triggerFlag = false;

export class AuctionCard extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      name: null,
      time: null,
      image: null,
      address: null,
      startTime: null,
      duration: null,
      bestOffer: null,
      currentOffer: null, // 现在出的价格
      startingPrice: null,
      addingPrice: null,
      user: null,
      deadline: null,
      auctionData: null,
      isTheCandidate: false// 判断是不是出的最高价的人
    };

  }

  componentDidMount () {
    if (this.props.info === null) {return;}
    let { startTime } = this.props.info;
    startTime = startTime.replace(/-/g, '/');
    startTime = startTime.replace(/(\.\d+)?/g, '');
    console.log('startTime', startTime);
    const startDate = new Date(startTime);
    console.log('startDate', startDate);
    const startSecond = startDate.getTime();
    console.log('startSecond', startSecond);
    let duration = null;
    duration = this.props.info.duration;
    const deadline = startSecond + duration * 1000;
    console.log('deadline', deadline);
    this.setState({ deadline: deadline });
    this.setState({ deadline: deadline });

    this.setState({
      name: this.props.info.goods.name,
      time: this.props.info.goodsDetail.time,
      image: this.props.info.goods.image,
      address: this.props.info.goods.address,
      startTime: this.props.info.startTime,
      duration: this.props.info.duration,
      bestOffer: this.props.info.bestOffer,
      currentOffer: this.props.info.currentOffer,
      startingPrice: this.props.info.startingPrice,
      addingPrice: this.props.info.addingPrice,
      auctionData: this.props.info
    });
  }

  onFinish () {

  }

  flushState () {
    tmpId = this.state.auctionData.auctionId;
    const callback = (data) => {
      auctionData = data.data;
      this.setState({ auctionData: data.data });
      this.setState({ bestOffer: data.data.bestOffer });
      console.log('当前最高价', data.data.bestOffer);
      if (data.data.userId === this.props.user) {
        this.setState({ isTheCandidate: true });
      } else {
        this.setState({ isTheCandidate: false });
      }
    };
    if (tmpId === null) {
      return;
    }
    const requestData = { auctionId: tmpId };
    getAuctionByAuctionId(requestData, callback);
    console.log('执行了flush');
  }

  getTimeType () { // 判断时间类型，0是没到拍卖开始时间，1是可以拍卖，2是过了拍卖的时间了
    let { startTime } = this.props.info;
    startTime = startTime.replace(/-/g, '/');
    startTime = startTime.replace(/(\.\d+)?/g, '');
    const startDate = new Date(startTime);
    const startSecond = startDate.getTime();
    const nowTime = new Date();
    const nowSecond = nowTime.getTime();
    if (nowSecond < startSecond) {return 0;}
    if (nowSecond > startSecond && nowSecond && nowSecond < startSecond + this.state.duration * 1000) {return 1;}
    return 2;
  }

  componentWillMount () {
    // 拦截判断是否离开当前页面
    window.addEventListener('beforeunload', this.beforeunload);
  }

  componentWillUnmount () {
    // 销毁拦截判断是否离开当前页面
    window.removeEventListener('beforeunload', this.beforeunload);
  }

  beforeunload (e) {
    clearInterval(startTrigger);
    const confirmationMessage = '关闭页面，停止发送请求';
    console.log(confirmationMessage);
    return confirmationMessage;
  }

    giveOffer=(value) => {
      this.setState({ currentOffer: value });
    }

    commitAuction=() => {
      if (this.props.loggedIn === true) {
        const { auctionId } = this.state.auctionData;
        const { userId } = this.props.user;
        const { currentOffer } = this.state;
        const json = {
          auctionId: auctionId,
          userId: userId,
          offer: currentOffer
        };
        const callback = (data) => {
          if (data.status >= 0) {
            message.success('恭喜您竞价成功');
          } else {
            message.error('出价请高于当前价格+加价幅度');
          }
        };
        updateAuction(json, callback);
      } else {
        message.error('请登录');
        history.push('/login');

      }
    }

    isTheCandidate=() => {
      if (this.state.isTheCandidate) {
        return <div>您是最高出价人</div>;
      } else {
        return <div>您不是最高出价人</div>;
      }
    }

    render () {
      if (this.state.bestOffer === null) {
        this.componentDidMount();
        return null;
      }
      if (this.getTimeType() === 0) {
        return (<Card hoverable={false} className="auction-card"> 拍卖还没开始</Card>);
      }
      if (this.getTimeType() === 2) {
        console.log('持续时间', this.state.duration);
        return (<Card hoverable={false} className="auction-card">拍卖已结束</Card>);
      }

      if (triggerFlag === false) {
        startTrigger = setInterval(() => {
          this.flushState();
        }, 1000);
        triggerFlag = true;
      }

      return (
        <Card hoverable={false} className="auction-card">
          <Row>
            <Col span={8} className="auction-card-poster">
              <img alt="auction-card-image" src={this.state.image} className="auction-card-img" />
            </Col>
            <Col span={16}>
              <Row className="auction-card-show-name">
                {this.state.name}
              </Row>
              <Row className="auction-card-show-time">
                <Col>时间：</Col>
                <Col>
                  {' '}
                  {this.state.time}
                </Col>
              </Row>
              <Row className="auction-card-show-address">
                <Col>
                              地点：
                </Col>
                <Col>
                  {this.state.address}
                </Col>
              </Row>
              <Row className="auction-card-tips">
                <ExclamationCircleFilled className="auction-card-icon" />
                          演出时间为演出当地时间，拍卖开始时间为北京时间
              </Row>

              <Row>
                <Col className="auction-card-stems">
                              拍卖开始时间:
                  {this.state.startTime}
                </Col>
                <Col className="auction-card-countdown">
                  <Countdown title="距离拍卖截止" value={this.state.deadline} onFinish={this.onFinish} />
                </Col>
              </Row>
              <Row>
                <Col className="auction-card-stems">
                              当前价
                </Col>
                <Col className="auction-card-stems">
                  {this.state.bestOffer}
                </Col>
              </Row>

              <Row>
                <Col className="auction-card-stems">
                              出价:
                </Col>
                <Col className="auction-card-choice">
                  <InputNumber defaultValue={this.state.bestOffer + this.state.addingPrice} step={this.state.addingPrice} onChange={this.giveOffer} />
                </Col>
                <Col>
                  {this.isTheCandidate()}
                  {this.state.isTheCandidate}
                </Col>
              </Row>
              <Row>
                <button className="auction-card-buy-button" onClick={this.commitAuction}>
                              确认出价
                </button>
              </Row>

              <Row>
                <Divider>拍卖说明</Divider>
              </Row>
              <Row>
                <Col className="auction-info-stem">
                              起拍价
                </Col>
                <Col className="auction-info-content">
                  {this.state.startingPrice}
                </Col>
                <Col className="auction-info-stem">
                              加价幅度
                </Col>
                <Col className="auction-info-content">
                  {this.state.addingPrice}
                </Col>
                <Col className="auction-info-stem">
                              竞价周期
                </Col>
                <Col className="auction-info-content">
                  {this.state.duration}
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      );
    }

}
