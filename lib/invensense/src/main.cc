#include <unistd.h>
#include <stdio.h>
#include <math.h>
#include <time.h>

#include "MotionSensor.h"

// #define delay_ms(a) usleep(a*1000)
/*
int main() {
	ms_open();
	do{
		ms_update();
		printf("yaw = %2.1f\tpitch = %2.1f\troll = %2.1f\ttemperature = %2.1f\tcompass = %2.1f, %2.1f, %2.1f\n",
		 ypr[YAW], ypr[PITCH],
		 ypr[ROLL],temp,compass[0],compass[1],compass[2]);
		delay_ms(5);
	}while(1);

	return 0;
}
*/

#include <nan.h>

using namespace v8;

float yaw() {
	return ypr[YAW];
}

float pitch() {
	return ypr[PITCH];
}

float roll() {
	return ypr[ROLL];
}

NAN_METHOD(ms_open) {
  info.GetReturnValue().Set(ms_open());
}

NAN_METHOD(ms_update) {
  info.GetReturnValue().Set(ms_update());
}

NAN_METHOD(yaw) {
  info.GetReturnValue().Set(yaw());
}

NAN_METHOD(pitch) {
  info.GetReturnValue().Set(pitch());
}

NAN_METHOD(roll) {
  info.GetReturnValue().Set(roll());
}

NAN_MODULE_INIT(init) {
  Nan::SetMethod(target, "ms_open", ms_open);
	Nan::SetMethod(target, "ms_update", ms_update);
	Nan::SetMethod(target, "yaw", yaw);
	Nan::SetMethod(target, "pitch", pitch);
	Nan::SetMethod(target, "roll", roll);
}

NODE_MODULE(binding, init)
