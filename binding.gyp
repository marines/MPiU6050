{
  "targets": [
    {
      "target_name": "ms_open",
      "sources": [
        "lib/invensense/src/main.cc",
        "../lib/invensense/src/libs/I2Cdev/I2Cdev.h",
        "../lib/invensense/src/MotionSensor/inv_mpu_lib/inv_mpu.h",
        "../lib/invensense/src/MotionSensor/inv_mpu_lib/inv_mpu_dmp_motion_driver.h"
      ],
      "libraries": [
        "../lib/invensense/src/libs/I2Cdev/I2Cdev.o",
        "../lib/invensense/src/MotionSensor/inv_mpu_lib/inv_mpu.o",
        "../lib/invensense/src/MotionSensor/inv_mpu_lib/inv_mpu_dmp_motion_driver.o",
        "../lib/invensense/src/MotionSensor/libMotionSensor.a"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}