/* eslint-disable react/prop-types */
import React from 'react';
import { Form, Input, Col, Row} from 'antd';

export class EditGoods extends React.Component {
  constructor (props) {
    super(props);
  }

    onFinish = (values) => {
      console.log(values);
    }

    render () {
      return (
        <Form
          layout="vertical"
          hideRequiredMark
          onFinish={this.onFinish}
          initialValues={{
            'name': this.props.name,
            'goodsId': this.props.goodsId
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="商品名"
              >
                <Input placeholder="商品名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="goodsId"
                label="商品ID"
              >
                <Input placeholder="商品ID" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      );
    }
}
