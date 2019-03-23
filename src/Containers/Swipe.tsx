import React, { Component } from 'react'
import { Platform, ScrollView, PanResponder, PanResponderInstance, PanResponderGestureState, ViewStyle, GestureResponderEvent, View } from 'react-native'

export const swipeDirections = {
  SWIPE_UP: 'SWIPE_UP',
  SWIPE_DOWN: 'SWIPE_DOWN',
  SWIPE_LEFT: 'SWIPE_LEFT',
  SWIPE_RIGHT: 'SWIPE_RIGHT'
}

enum SwipeDirection {
  SWIPE_UP = 'SWIPE_UP',
  SWIPE_DOWN = 'SWIPE_DOWN',
  SWIPE_LEFT = 'SWIPE_LEFT',
  SWIPE_RIGHT = 'SWIPE_RIGHT',
  unknown = 'unknown'
}

interface GeneralConfig {
  velocityThreshold: number
  directionalOffsetThreshold: number
}

interface SwipeConfig {
  minVelocity: number
  minDistance: number
  maxOtherDistance: number
}

const swipeConfig: SwipeConfig = {
  minVelocity: 0.3,
  minDistance: 40,
  maxOtherDistance: 40
}

function isValidSwipe(
  velocity,
  minVelocity,
  distance,
  minDistance,
  otherDistance,
  maxOtherDistance
) {
  return (
    Math.abs(velocity) > minVelocity
    && (!minDistance || Math.abs(distance) >= minDistance)
    && (!maxOtherDistance || Math.abs(otherDistance) < Math.abs(distance))
  )
}

interface ScreenProps {
  config: GeneralConfig
  style?: ViewStyle,
  onTouchEnd?: () => void
  onSwipe?: (gestureState: PanResponderGestureState) => void
  onSwipeUp?: (gestureState: PanResponderGestureState) => void
  onSwipeDown?: (gestureState: PanResponderGestureState) => void
  onSwipeLeft?: (gestureState: PanResponderGestureState) => void
  onSwipeRight?: (gestureState: PanResponderGestureState) => void
}

class Swipe extends Component<ScreenProps> {
  swipeConfig: GeneralConfig & SwipeConfig
  _panResponder?: PanResponderInstance
  constructor(props, context) {
    super(props, context)
    this.swipeConfig = Object.assign(swipeConfig, props.config)
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleShouldSetPanResponder,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd
    })
  }

  componentWillReceiveProps(props) {
    this.swipeConfig = Object.assign(swipeConfig, props.config)
  }

  componentWillMount() {
    // this._panResponder = PanResponder.create({
    //   onStartShouldSetPanResponder: this._handleShouldSetPanResponder,
    //   onMoveShouldSetPanResponder: this._handleShouldSetPanResponder,
    //   onPanResponderRelease: this._handlePanResponderEnd,
    //   onPanResponderTerminate: this._handlePanResponderEnd
    // })
  }

  _handleShouldSetPanResponder = (evt: GestureResponderEvent, gestureState: PanResponderGestureState): boolean => {
    return (
      (evt.nativeEvent.touches.length === 1 && !this._gestureIsClick(gestureState) && this._validateSwipe(gestureState)) || false
    )
  }

  _validateSwipe = (gestureState) => {
    const {
      onSwipe,
      onSwipeUp,
      onSwipeDown,
      onSwipeLeft,
      onSwipeRight
    } = this.props
    const swipeDirection = this._getSwipeDirection(gestureState)
    return (
      ((onSwipe || onSwipeUp) && swipeDirection === SwipeDirection.SWIPE_UP) ||
      ((onSwipe || onSwipeDown) && swipeDirection === SwipeDirection.SWIPE_DOWN) ||
      ((onSwipe || onSwipeLeft) && swipeDirection === SwipeDirection.SWIPE_LEFT) ||
      ((onSwipe || onSwipeRight) && swipeDirection === SwipeDirection.SWIPE_RIGHT)
    )
  }

  _gestureIsClick = (gestureState) => {
    return Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5
  }

  _handlePanResponderEnd = (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const swipeDirection = this._getSwipeDirection(gestureState)
      this._triggerSwipeHandlers(swipeDirection, gestureState)
  }

  _triggerSwipeHandlers = (swipeDirection: SwipeDirection, gestureState: PanResponderGestureState) => {
    const {
      onSwipeUp,
      onSwipeDown,
      onSwipeLeft,
      onSwipeRight
    } = this.props

    switch (swipeDirection) {
      case SwipeDirection.SWIPE_LEFT:
        if (onSwipeLeft) {
          onSwipeLeft(gestureState)
        }
        break
      case SwipeDirection.SWIPE_RIGHT:
        if (onSwipeRight) {
          onSwipeRight(gestureState)
        }
        break
      case SwipeDirection.SWIPE_UP:
        if (onSwipeUp) {
          onSwipeUp(gestureState)
        }
        break
      case SwipeDirection.SWIPE_DOWN:
        if (onSwipeDown) {
          onSwipeDown(gestureState)
        }
        break
    }
  }

  _getSwipeDirection = (gestureState: PanResponderGestureState): SwipeDirection => {
    // const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections
    const { dx, dy } = gestureState
    if (this._isValidHorizontalSwipe(gestureState)) {
      return dx > 0 ? SwipeDirection.SWIPE_RIGHT : SwipeDirection.SWIPE_LEFT
    } else if (this._isValidVerticalSwipe(gestureState)) {
      return dy > 0 ? SwipeDirection.SWIPE_DOWN : SwipeDirection.SWIPE_UP
    }
    return SwipeDirection.unknown
  }

  _isValidHorizontalSwipe = (gestureState: PanResponderGestureState) => {
    const { vx, dx, dy } = gestureState
    const { minVelocity, minDistance, maxOtherDistance } = this.swipeConfig
    return isValidSwipe(vx, minVelocity, dx, minDistance, dy, maxOtherDistance)
  }

  _isValidVerticalSwipe = (gestureState: PanResponderGestureState) => {
    const { vy, dx, dy } = gestureState
    const { minVelocity, minDistance, maxOtherDistance } = this.swipeConfig
    return isValidSwipe(vy, minVelocity, dy, minDistance, dx, maxOtherDistance)
  }

  render() {
    const panHandlers = this._panResponder ? this._panResponder.panHandlers : {}
    if (Platform.OS === 'android') {
      return <View {...this.props} {...panHandlers} />
    } else {
      return <ScrollView {...this.props} {...panHandlers} />
    }
  }
}

export default Swipe
