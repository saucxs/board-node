const Base = require('./base');
module.exports = class extends Base {
    async loginAction() {
        let {staffCode, password} = this.get();
        const salt = 'board';
        password = think.md5(salt + password);
        console.log(password, '====================================')
        try {
            let user = await this.model('staff').where({
                staffCode,
            }).find();
            if(user.staff_password && user.staff_password == password) {
                // login success
                await this.session('userInfo', user);
                return this.json({
                    retValue: 1,
                    resultMsg: 'OK',
                    data: user
                })
            } else {
                return this.json({
                    retValue: -1,
                    resultMsg: '密码错误',
                    data: {}
                })
            }
        }catch(e) {
            console.log(e);
            return this.json({
                retValue: -1,
                resultMsg: '登陆失败',
                data: {}
            })
        }
    }
    async logoutAction() {
        try {
            //记录登出的记录
            let dateTime = new Date();
            let logout_time = think.datetime(dateTime);
            await this.model('log').add({
                flag: 0, usernum: this.user.usernum, username: this.user.username, logout_time, password: this.user.password
            });
            await this.session(null);
            return this.success("登出成功");
        } catch(e) {
            return this.fail(`登出失败${e}`)
        }
    }

    async changepassAction () {
        let {
            usernum,
            oldpassword,
            newpassword
        } = this.post()
        try {
            let user = await this.model('user').where({
              usernum,
            }).find();
            const salt = 'weekly';
            oldpassword = think.md5(salt + oldpassword);
            if(user.password && user.password == oldpassword) {
                // login success
                const salt = 'weekly';
                newpassword = think.md5(salt + newpassword);
                await this.model('user').where({
                  usernum
                }).update({
                  usernum,
                    password: newpassword
                })
                return this.success("修改成功");
            } else {
                return this.fail("原密码错误");
            }
        } catch(e) {
            return this.fail('修改失败');
        }
    }
    async registerAction() {
        let company_id = this.user.company_id || this.post('company_id');
        let company_name  = this.user.company_name || this.post('company_name');
        let department_id = this.user.department_id || this.post('department_id');
        let department_name = this.user.department_name || this.post('department_name');
        let {username, usernum, email, telephone, type, id} = this.post();
        let role = this.post('role') || 4;
        let role_name = this.post('role_name') || '成员';
        try {
          if(type == 'add' || type == 'companyAdminAdd'){
            let userExist = await this.model('user').where({
              usernum
            }).select();
            if(!think.isEmpty(userExist)) {
              return this.fail("工号已经存在");
            }
            const salt = 'weekly';
            let password = think.md5(salt + '123456');
              let dateTime = new Date();
              let create_time = dateTime.getFullYear() + '-' +  Number(dateTime.getMonth() + 1 )  + '-' + dateTime.getDate() + ' '+ dateTime.getHours() + ':' + dateTime.getMinutes() + ':' + dateTime.getSeconds();
              await this.model('user').add({
              usernum, username, telephone, role, role_name, password, email, company_id, company_name, department_id, department_name, create_time
            });
            return this.success("添加成功");
          }else if(type == 'edit' || type == 'companyAdminEdit'){
            if(id){
                let dateTime = new Date();
                let update_time = dateTime.getFullYear() + '-' +  Number(dateTime.getMonth() + 1 )  + '-' + dateTime.getDate() + ' '+ dateTime.getHours() + ':' + dateTime.getMinutes() + ':' + dateTime.getSeconds();
                await this.model('user').where({
                id
              }).update({
                usernum, username, telephone, role, role_name,email, company_id, company_name, department_id, department_name, update_time
              });
              return this.success("修改成功");
            }else{
              return this.fail("缺少参数id");
            }
          }
        } catch(e) {
            return this.fail("添加失败", e);
        }
    }

  async deleteUserAction() {
    let {usernum} = this.post();
    let company_id = this.user.company_id || this.post('company_id');
    let department_id = this.user.department_id || this.post('department_id');
    try {
      await this.model('user').where({usernum, company_id, department_id}).delete();
      await this.model('week').where({usernum, company_id, department_id}).delete();
      return this.success("删除成功");
    } catch(e) {
      return this.fail(`删除失败${e}`)
    }
  }

}
