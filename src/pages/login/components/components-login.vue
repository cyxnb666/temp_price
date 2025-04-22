<template>
  <t-form
    ref="form"
    :class="['item-container', `login-${type}`]"
    :data="formData"
    :rules="FORM_RULES"
    label-width="0"
    @submit="onSubmit"
  >
    <template v-if="type == 'password'">
      <t-form-item name="userMobile">
        <t-input v-model="formData.userMobile" size="large" placeholder="请输入账号">
          <template #prefix-icon>
            <user-icon />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item name="cipher">
        <t-input
          v-model="formData.cipher"
          size="large"
          :type="showPsw ? 'text' : 'password'"
          clearable
          key="cipher"
          placeholder="请输入登录密码"
        >
          <template #prefix-icon>
            <lock-on-icon />
          </template>
          <template #suffix-icon>
            <browse-icon v-if="showPsw" @click="showPsw = !showPsw" key="browse" />
            <browse-off-icon v-else @click="showPsw = !showPsw" key="browse-off" />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item class="verification-code" name="verifyCode">
        <t-input v-model="formData.verifyCode" size="large" placeholder="请输入验证码" key="verifyCode" />
        <t-image
          @click="refreshVerifyCode"
          variant="outline"
          :src="verifyCodeUrl"
          fit="fill"
          :style="{ width: '120px', height: '40px', cursor: 'pointer' }"
          position="left"
        />
      </t-form-item>
      <!-- <div class="check-container remember-pwd">
        <t-checkbox>记住账号</t-checkbox>
      </div> -->
    </template>

    <!-- 扫码登陆 -->
    <template v-else-if="type == 'qrcode'">
      <div class="tip-container">
        <span class="tip">请使用微信扫一扫登录</span>
        <span class="refresh"
          >刷新
          <refresh-icon color="#0052D9" />
        </span>
      </div>
      <qrcode-vue value="" :size="192" level="H" />
    </template>

    <!-- 手机号登陆 -->
    <template v-else>
      <t-form-item name="phone">
        <t-input v-model="formData.phone" size="large" placeholder="请输入您的手机号">
          <template #prefix-icon>
            <user-icon />
          </template>
        </t-input>
      </t-form-item>

      <t-form-item class="verification-code" name="verifyCode">
        <t-input v-model="formData.verifyCode" size="large" placeholder="请输入验证码" key="verifyCode" />
        <t-button variant="outline" :disabled="countDown > 0" @click="handleCounter">
          {{ countDown == 0 ? '发送验证码' : `${countDown}秒后可重发` }}
        </t-button>
      </t-form-item>
    </template>

    <t-form-item v-if="type !== 'qrcode'" class="btn-container">
      <t-button block size="large" type="submit"> 登录 </t-button>
    </t-form-item>

    <div class="switch-container">
      <span v-if="type !== 'password'" class="tip" @click="switchType('password')">使用账号密码登录</span>
    </div>
  </t-form>
</template>
<script lang="ts">
import Vue from 'vue';
import QrcodeVue from 'qrcode.vue';
import md5 from 'js-md5';

import { UserIcon, LockOnIcon, BrowseOffIcon, BrowseIcon, RefreshIcon } from 'tdesign-icons-vue';
import Header from '@/layouts/components/Header.vue';

import { UUID } from 'uuidjs';
let uuid = UUID.generate();

const INITIAL_DATA = {
  // phone: '',
  userMobile: '',
  cipher: '',
  verifyCode: '',
  jsessionid: '',
  // checked: false,
};

const FORM_RULES = {
  phone: [{ required: true, message: '手机号必填', type: 'error' }],
  userMobile: [{ required: true, message: '账号必填', type: 'error' }],
  cipher: [{ required: true, message: '密码必填', type: 'error' }],
  verifyCode: [{ required: true, message: '验证码必填', type: 'error' }],
};
/** 高级详情 */
export default Vue.extend({
  name: 'Login',
  components: {
    QrcodeVue,
    UserIcon,
    LockOnIcon,
    BrowseOffIcon,
    BrowseIcon,
    RefreshIcon,
  },
  data() {
    return {
      FORM_RULES,
      type: 'password',
      formData: { ...INITIAL_DATA },
      showPsw: false,
      countDown: 0,
      intervalTimer: null,
      verifyCodeUrl: '',
    };
  },
  created() {
    this.refreshVerifyCode();
    setInterval(() => {
      this.refreshVerifyCode();
    }, 1000 * 60 * 2);
  },
  beforeDestroy() {
    clearInterval(this.intervalTimer);
  },
  methods: {
    // 刷新验证码
    async refreshVerifyCode() {
      let jsessionid = new Date().getTime() + uuid;
      this.formData.jsessionid = jsessionid;
      try {
        this.$request
          .get('/web/auth/getVerifyCode', {
            responseType: 'arraybuffer',
            headers: {
              jsessionid: jsessionid,
            },
          })
          .then((res) => {
            console.log(res);
            const blob = new Blob([res.data], { type: 'image/jpeg' });
            if (this.verifyCodeUrl) {
              URL.revokeObjectURL(this.verifyCodeUrl);
            }
            // 直接使用返回的blob创建URL，无需再包装成新的Blob
            this.verifyCodeUrl = URL.createObjectURL(blob);
          })
          .catch((e: Error) => {
            console.log(e);
          })
          .finally(() => {
            this.dataLoading = false;
          });
      } catch (error) {
        console.error('验证码刷新失败:', error);
        this.$message.error('验证码获取失败，请重试');
      }
    },
    switchType(val) {
      this.type = val;
      this.$refs.form.reset();
    },
    async onSubmit({ validateResult }) {
      if (validateResult === true) {
        let params = {
          ...this.formData,
          cipher: md5(this.formData.cipher),
        };
        this.$store
          .dispatch('user/login', params)
          .then((data) => {
            this.$message.success('登录成功');
            this.$router.replace('/setting');
          })
          .catch(() => {
            this.refreshVerifyCode();
          });
      }
    },
    handleCounter() {
      this.countDown = 60;
      this.intervalTimer = setInterval(() => {
        if (this.countDown > 0) {
          this.countDown -= 1;
        } else {
          clearInterval(this.intervalTimer);
          this.countDown = 0;
        }
      }, 1000);
    },
  },
});
</script>
