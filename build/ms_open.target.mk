# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := ms_open
DEFS_Debug := \
	'-DNODE_GYP_MODULE_NAME=ms_open' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-DBUILDING_NODE_EXTENSION' \
	'-DDEBUG' \
	'-D_DEBUG'

# Flags passed to all source files.
CFLAGS_Debug := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-g \
	-O0

# Flags passed to only C files.
CFLAGS_C_Debug :=

# Flags passed to only C++ files.
CFLAGS_CC_Debug := \
	-fno-rtti \
	-fno-exceptions \
	-std=gnu++0x

INCS_Debug := \
	-I/home/pi/.node-gyp/7.2.1/include/node \
	-I/home/pi/.node-gyp/7.2.1/src \
	-I/home/pi/.node-gyp/7.2.1/deps/uv/include \
	-I/home/pi/.node-gyp/7.2.1/deps/v8/include \
	-I$(srcdir)/node_modules/nan

DEFS_Release := \
	'-DNODE_GYP_MODULE_NAME=ms_open' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-DBUILDING_NODE_EXTENSION'

# Flags passed to all source files.
CFLAGS_Release := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-O3 \
	-fno-omit-frame-pointer

# Flags passed to only C files.
CFLAGS_C_Release :=

# Flags passed to only C++ files.
CFLAGS_CC_Release := \
	-fno-rtti \
	-fno-exceptions \
	-std=gnu++0x

INCS_Release := \
	-I/home/pi/.node-gyp/7.2.1/include/node \
	-I/home/pi/.node-gyp/7.2.1/src \
	-I/home/pi/.node-gyp/7.2.1/deps/uv/include \
	-I/home/pi/.node-gyp/7.2.1/deps/v8/include \
	-I$(srcdir)/node_modules/nan

OBJS := \
	$(obj).target/$(TARGET)/lib/invensense/src/main.o

# Add to the list of files we specially track dependencies for.
all_deps += $(OBJS)

# CFLAGS et al overrides must be target-local.
# See "Target-specific Variable Values" in the GNU Make manual.
$(OBJS): TOOLSET := $(TOOLSET)
$(OBJS): GYP_CFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_C_$(BUILDTYPE))
$(OBJS): GYP_CXXFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_CC_$(BUILDTYPE))

# Suffix rules, putting all outputs into $(obj).

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(srcdir)/%.cc FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# Try building from generated source, too.

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj).$(TOOLSET)/%.cc FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj)/%.cc FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# End of this set of suffix rules
### Rules for final target.
LDFLAGS_Debug := \
	-pthread \
	-rdynamic

LDFLAGS_Release := \
	-pthread \
	-rdynamic

LIBS := \
	../lib/invensense/src/libs/I2Cdev/I2Cdev.o \
	../lib/invensense/src/MotionSensor/inv_mpu_lib/inv_mpu.o \
	../lib/invensense/src/MotionSensor/inv_mpu_lib/inv_mpu_dmp_motion_driver.o \
	../lib/invensense/src/MotionSensor/libMotionSensor.a

$(obj).target/ms_open.node: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
$(obj).target/ms_open.node: LIBS := $(LIBS)
$(obj).target/ms_open.node: TOOLSET := $(TOOLSET)
$(obj).target/ms_open.node: $(OBJS) FORCE_DO_CMD
	$(call do_cmd,solink_module)

all_deps += $(obj).target/ms_open.node
# Add target alias
.PHONY: ms_open
ms_open: $(builddir)/ms_open.node

# Copy this to the executable output path.
$(builddir)/ms_open.node: TOOLSET := $(TOOLSET)
$(builddir)/ms_open.node: $(obj).target/ms_open.node FORCE_DO_CMD
	$(call do_cmd,copy)

all_deps += $(builddir)/ms_open.node
# Short alias for building this executable.
.PHONY: ms_open.node
ms_open.node: $(obj).target/ms_open.node $(builddir)/ms_open.node

# Add executable to "all" target.
.PHONY: all
all: $(builddir)/ms_open.node

