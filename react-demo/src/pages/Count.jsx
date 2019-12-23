import React, {Component} from 'react';
import { Cell, Button } from  'zarm';

export default class Count extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        }
    }

    handleClick() {
        this.setState({
            count: ++this.state.count
        });
    }

    render() {
        return (
            <div>
              <Cell>当前count值：{this.state.count}</Cell>
              <br/>
              <Button theme="primary" onClick={() => this.handleClick()}>增加</Button>
            </div>
        )
    }
}
