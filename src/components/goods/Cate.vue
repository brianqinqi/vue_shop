<template>
    <div>
      <!--面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片视图区域-->
      <el-card>
        <!--第一行，添加分类-->
        <el-row>
          <el-col>
            <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
          </el-col>
        </el-row>
      <!--表格区域：elementUI没有，需要引入第三方库-->
        <tree-table
          class="treeTable"
          :data="cateList"
          :columns="columns"
          show-index index-text="#"
          :expand-type="false" :selection-type="false"
          border
          :show-row-hover="false">
          <!--是否有限-->
          <template v-slot:isok="scope">
            <i class="el-icon-success" style="color: lightgreen"
               v-if="scope.row.cat_deleted === false"></i>
            <i class="el-icon-error" style="color: red"
               v-else></i>
          </template>
          <!--排序-->
          <template v-slot:order="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag size="mini" type="warning" v-else>三级</el-tag>
          </template>
          <!--操作-->
          <template v-slot:operation="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
          </template>
        </tree-table>
        <!--分页区域-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
      <!--添加分类的对话框-->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
      @closed="addCateDialogClosed">
        <!--添加分类的表单-->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef"
                 label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              clearable
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged">
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!--编辑分类的对话框-->
      <el-dialog
        title="修改分类"
        :visible.sync="editCateDialogVisible"
        width="50%" @closed="editCateDialogClosed">
        <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef"
                 label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="editCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCateSubmit">确 定</el-button>
  </span>
      </el-dialog>
      <!--删除分类的对话框-->
    </div>
</template>

<script>
export default {
  name: 'Cate',
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，商品总数据条数，为table指定列的定义
      cateList: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 指定这一列为模板列
          type: 'template',
          // 这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 指定这一列为模板列
          type: 'template',
          // 这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 指定这一列为模板列
          type: 'template',
          // 这一列使用的模板名称
          template: 'operation'
        }
      ],
      // 控制添加分类对话框的显示与隐藏，添加分类的表单数据对象，规则
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的数据列表
      parentCateList: [],
      // 级联选择器
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制修改分类对话框的显示与隐藏
      editCateDialogVisible: false,
      editCateForm: {
        cat_id: '',
        cat_name: ''
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 分页区域的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 添加分类
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
    },
    // 级联表单选择项发生变化
    parentCateChanged () {
      // console.log(this.selectedKeys)
      // selectedKeys.length > 0，说明选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 添加的分类的等级值
        this.addCateForm.cat_level = this.selectedKeys.length
        // return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 添加分类对话框关闭
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 打开编辑分类对话框
    async showEditCateDialog (id) {
      this.editCateForm.cat_id = id
      const { data: res } = await this.$http.get('categories/' + this.editCateForm.cat_id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类名称失败')
      }
      this.editCateForm.cat_name = res.data.cat_name
      this.editCateDialogVisible = true
    },
    // 编辑分类对话框的关闭
    editCateDialogClosed () {
      this.$refs.editCateFormRef.resetFields()
    },
    // 编辑分类提交
    editCateSubmit () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) {
          return this.$message.error('更新分类失败')
        }
        this.$message.success('更新分类成功')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 删除分类
    async deleteCate (id) {
      const confirmRes = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已经取消了删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.$message.success('删除分类成功')
      this.getCateList()
    }
  }
}
</script>

<style scoped lang="less">
.treeTable{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
  height: 100%;
}
</style>
<style>
  .el-popper, .el-cascader-panel{
    height: 200px;
    overflow: hidden;
  }
</style>
