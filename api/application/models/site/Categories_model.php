<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Categories_model extends CI_Model {

    public function get($id = false)
    {

        if ( $id == false ) {
            $q = $this->db->get('categories');
            $q = $q->result();
        } else {
            $this->db->where('id', $id);
            $q = $this->db->get('categories');
            $q = $q->row();
        }

        return $q;
    }

    public function getByCategorySlug( $slug )
    {

        $this->db->where( 'slug' , $slug );
        $category = $this->db->get( 'categories' );
        $category = $category->row();

        return $category;

    }

}