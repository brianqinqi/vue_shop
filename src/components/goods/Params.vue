
<template>
    <div>
      <!--面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片视图区域-->
      <el-card>
        <!--头部的警告区域-->
        <el-alert
          title="注意：只允许为第三级分类设置相关参数！"
          type="warning"
          :closable="false" show-icon>
        </el-alert>
        <!--选择商品分类区域-->
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <!--选择商品分类的级联选择框-->
            <el-cascader
              v-model="selectedCateKeys"
              :options="cateList"
              :props="cateProps"
              @change="handleChange"></el-cascader>
          </el-col>
        </el-row>
        <!--tab页签区域-->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <!--动态参数-->
          <el-tab-pane label="动态参数" name="many">
            <!--添加动态参数按钮-->
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogVisible = true">添加参数</el-button>
            <!--动态参数表格-->
            <el-table :data="manyTableData" border stripe>
              <el-table-column type="expand">
                <template v-slot="scope">
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i"
                          closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small"
                             @click="showInput(scope.row)">
                    + New Tag
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!--静态属性-->
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogVisible = true">添加属性</el-button>
            <el-table :data="onlyTableData" border stripe>
              <el-table-column type="expand">
                <template v-slot="scope">
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i"
                          closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small"
                             @click="showInput(scope.row)">
                    + New Tag
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      <!--添加参数的对话框-->
      <el-dialog
        @closed="addParamsDialogClosed"
        :title="'添加' + titleText"
        :visible.sync="addParamsDialogVisible"
        width="50%">
        <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addParamsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParamsSubmit">确 定</el-button>
        </span>
      </el-dialog>
      <!--修改对话框-->
      <el-dialog
        @closed="editParamsDialogClosed"
        :title="'修改' + titleText"
        :visible.sync="editParamsDialogVisible"
        width="50%">
        <el-form :model="editParamsForm" :rules="addParamsFormRules" ref="editParamsFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editParamsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParamsSubmit">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedCateKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addParamsDialogVisible: false,
      addParamsForm: {
        attr_name: ''
      },
      addParamsFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      editParamsDialogVisible: false,
      editParamsForm: {
        attr_name: '',
        attr_id: ''
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    handleChange () {
      this.getParamsData()
    },
    handleTabClick () {
      this.getParamsData()
    },
    async getParamsData () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.error('只允许选择第三级分类')
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    addParamsDialogClosed () {
      this.$refs.addParamsFormRef.resetFields()
    },
    addParamsSubmit () {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addParamsDialogVisible = false
        this.getParamsData()
      })
    },
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editParamsForm = res.data
      this.editParamsDialogVisible = true
    },
    editParamsDialogClosed () {
      this.$refs.editParamsFormRef.resetFields()
    },
    editParamsSubmit () {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`, {
          attr_name: this.editParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数信息失败')
        }
        this.$message.success('修改参数信息成功')
        this.getParamsData()
        this.editParamsDialogVisible = false
      })
    },
    async removeParams (attrId) {
      const confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    handleInputConfirm (row) {
      if (row.inputValue.trim().length !== 0) {
        row.attr_vals.push(row.inputValue.trim())
      }
      row.inputValue = ''
      row.inputVisible = false
      this.changeAttrVals(row)
    },
    async changeAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if (res.meta.status !== 200) {
        this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数成功')
    },
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      // console.log(row.attr_vals)
      this.changeAttrVals(row)
    }
  },
  computed: {
    /*
    * 控制参数与属性按钮是否激活
    * 禁用：返回true
    * 激活：返回false
    * */
    isBtnDisabled () {
      return this.selectedCateKeys.length !== 3
    },
    // 当前选中的三级分类的id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算添加参数对话框标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style scoped lang="less">
.cat_opt{
  margin: 15px 0;
}
.el-tag{
  margin: 10px;
}
.input-new-tag{
  width: 120px;
}
</style>
