
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="prose prose-lg max-w-none">
      <div className="text-center">
        <h1 className="text-4xl font-bold !mb-2">关于我</h1>
        <div className="w-24 h-px bg-border mx-auto my-4"></div>
      </div>
      
      <p>鸡蛋好吃，还想看看下蛋公鸡的样子？感谢跳转到本页！欢迎与我建立联系！</p>
      
      <p>邮件方式，请直接点击：</p>
      
      <ul>
        <li><a href="mailto:example@example.com?subject=指正文章错误">指正文章错误</a></li>
        <li><a href="mailto:example@example.com?subject=遇到难题协助排查">遇到难题协助排查</a></li>
        <li><a href="mailto:example@example.com?subject=腾讯 & Shopee 内推">腾讯 & Shopee 内推</a></li>
        <li><a href="mailto:example@example.com?subject=给我提供工作机会">给我提供工作机会</a></li>
      </ul>

      <p>关注“<strong>老白码农在奋斗</strong>”公众号，关注文章更新，索取联系方式</p>
    </div>
  );
};

export default AboutPage;
