<template>
    <div>
      <!--面包屑导航-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片视图-->
      <el-card>
        <!--添加角色按钮-->
        <el-row>
          <el-col>
            <el-button type="primary" @click="addRole">添加角色</el-button>
          </el-col>
        </el-row>
        <!--角色列表区域-->
        <el-table :data="rolesList" border stripe>
          <!--展开列-->
          <el-table-column type="expand">
            <template v-slot="scope">
              <el-row :class="['bdbottom', i1 === 0 ? 'bdtop': '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                <!--渲染一级-->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!--渲染二级和三级-->
                <el-col :span="19">
                  <el-row :class="[i2 === 0 ? '':'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                      <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!--索引列-->
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template v-slot="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <!--添加角色的对话框-->
      <el-dialog
        title="添加角色"
        :visible.sync="addRoleDialogVisible"
        width="50%"
      @close="addRoleDialogClosed">
        <el-form
          :model="addRoleForm"
          :rules="addRoleFormRules"
          ref="addRoleFormRef"
          label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoleSubmit">确 定</el-button>
        </span>
      </el-dialog>
      <!--编辑角色的对话框-->
      <el-dialog
        title="编辑角色"
        :visible.sync="editRoleDialogVisible"
        width="50%"
      @close="editRoleDialogClosed">
        <el-form :model="editRoleForm"
                 :rules="addRoleFormRules"
                 ref="editRoleFormRef"
                 label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="editRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRoleSubmit">确 定</el-button>
  </span>
      </el-dialog>
      <!--分配权限的对话框-->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDialogClosed">
        <!--树形控件-->
        <el-tree
          :data="rightsList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defaultKeys"
          ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限对话框显示与隐藏
      setRightDialogVisible: false,
      // 所有权限数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 树形控件中默认选中的节点id值数组
      defaultKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      // 添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 编辑角色
      editRoleDialogVisible: false,
      editRoleForm: {
        id: '',
        roleName: '',
        roleDesc: ''
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取权限列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    // 根据id删除对应的权限
    async removeRightById (role, rightId) {
      // 弹框提示
      const confirmRes = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 确认为confirm，取消为cancel
      // console.log(confirmRes)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已经取消了删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // this.getRolesList()
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      // 获取到的权限数据
      this.rightsList = res.data
      // 获取当前角色，默认选中的权限，的id数组
      this.getDefaultKeys(role, this.defaultKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归形式获取角色下所有三级权限的id，并保存到数组defaultKeys中
    getDefaultKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getDefaultKeys(item, arr)
      })
    },
    // 分配权限对话框的关闭事件
    setRightDialogClosed () {
      this.defaultKeys = []
    },
    // 为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 添加角色
    addRole () {
      this.addRoleDialogVisible = true
    },
    // 提交添加角色
    addRoleSubmit () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        // 发起添加用户的网络请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        this.addRoleDialogVisible = false
        this.getRolesList()
      })
    },
    // 添加角色对话框关闭
    addRoleDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 修改角色
    async editRole (id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色失败')
      }
      this.editRoleForm.id = res.data.roleId
      this.editRoleForm.roleName = res.data.roleName
      this.editRoleForm.roleDesc = res.data.roleDesc
      this.editRoleDialogVisible = true
    },
    editRoleSubmit () {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editRoleForm.id, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('编辑角色失败')
        }
        this.editRoleDialogVisible = false
        this.getRolesList()
        this.$message.success('编辑角色成功')
      })
    },
    editRoleDialogClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 删除角色
    async deleteRole (id) {
      const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已经取消了删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      this.getRolesList()
    }
  }
}
</script>

<style scoped lang="less">
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
